const express = require('express');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');


const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const uri = 'mongodb+srv://mongoAdmin:mongoPassword@cluster0-yjkuw.mongodb.net/test';
const client = new MongoClient(uri, { useNewUrlParser: true });

var collections = {};
client.connect((err) => {
    if (err) {
        console.log("There was an error while establishing a connection with the database client: ", err);
    }
    else {
        collections = {
            summary: client.db("covidData").collection("summary"),
            summaryDemographics: client.db("covidData").collection("summary-demographics"),
            countries: client.db("covidData").collection("countries"),
            countryDemographics: client.db("covidData").collection("country-demographics"),
            casesChart: client.db("covidData").collection("cases-chart"),
            doesNotExist: client.db("covidData").collection("does-not-exist"),
            doesNotExistEither: client.db("doesNotExist").collection("does-not-exist"),
        };
        console.log("******************************************\n********************\n***************\n*******", collections.casesChart, collections.doesNotExist, collections.doesNotExistEither, "....\n.\n.\n.\n.");
    }
})

app.get('/summary', function (req, res) {
    const options = {
        "projection": { "_id": 0 },
        "sort": { "Country": 1 },
    };
    collections.summaryDemographics.find(undefined, options).toArray()
        .then(items => {
            console.log(`Successfully found ${items.length} documents.`);
            res.send({ summary: items.map((item) => ({ ...item.data })) });
        })
        .catch(err => console.error(`Failed to find documents 001: ${err}`));
});

app.get('/cases-chart/:countryCode', function (req, res) {
    const countryCode = req.params.countryCode;
    const query = { "_id": countryCode };
    const options = {
        "projection": { "data": 1 }
    };
    collections.casesChart.find(query, options).toArray()
        .then(items => {
            res.send({
                data: _.get(items[0], 'data', {}),
            });
        })
        .catch(err => console.error(`Failed to find documents 003: ${err}`));
});

app.get('/ping', function (req, res) {
    return res.send({ "res": "pong" });
});

cron.schedule("10 * * * *", function () {
    const jobId = '002';
    const options = {
        "projection": { "data": 1 },
    };
    collections.summary.find(undefined, options).toArray()
        .then(items => {
            console.log(`Successfully found ${items.length} documents.`);
            console.log(items);
            items.forEach(({ data }) => {
                var url = `https://api.covid19api.com/total/dayone/country/${data.Slug}`;
                fetch(url)
                    .then(res => res.json())
                    .then((result) => {
                        if (!_.isEmpty(result)) {
                            const dataToPutIn = { _id: data.CountryCode, data: result };
                            collections.countries.save(dataToPutIn, function (error, data) {
                                if (error) {
                                    console.log(`Error is on save`, error);
                                } else {
                                    console.log(`CRON job to fetch ${url} finished successfully. Data: `, data);
                                }
                            })
                            const chartData = {
                                _id: data.CountryCode,
                                data: result.map(({
                                    Active: active,
                                    Confirmed: confirmed,
                                    Date: date,
                                    Deaths: deaths,
                                    Recovered: recovered,
                                }) => {
                                    const dateString = new Date(date).toLocaleDateString();
                                    return ({
                                        active,
                                        confirmed,
                                        date: dateString,
                                        deaths,
                                        recovered,
                                    })
                                })
                            };
                            collections.casesChart.save(chartData, function (error, data) {
                                if (error) {
                                    console.log(`Error is on save`, error);
                                } else {
                                    console.log(`Job to extract cases chart data finished successfully.`);
                                }
                            })
                        }
                    })
                    .catch((err) => console.log(err));
            })
        })
        .catch(err => console.log(`Failed to find documents ${jobId}: ${err}`))
});

cron.schedule("8 * * * *", function () {
    var urlOne = 'https://api.covid19api.com/summary';
    fetch(urlOne)
        .then((res) => res.json())
        .then((data) => {
            const countries = _.get(data, 'Countries', []);
            // perform actions on the collection object
            countries.forEach((country) => {
                collections.summary.save({ _id: country.CountryCode, data: country }, function (error, data) {
                    if (error) {
                        console.log('Error is on insert', error);
                    } else
                        console.log(`CRON job to fetch ${urlOne} finished successfully. Data: `, data);
                });
            });
        })
        .catch((err) => console.log(err));
});

cron.schedule("23 * * * *", function () {
    collections.summary.aggregate([
        {
            $lookup:
            {
                from: 'country-demographics',
                localField: '_id',
                foreignField: '_id',
                as: 'demographics'
            }
        }
    ]).toArray(function (error, response) {
        if (error) console.log('Error is on aggregate', error);
        response.forEach((country) => {
            console.log(country);
            const inputDocument = {
                _id: country.data.CountryCode,
                data: {
                    ...country.data,
                    Population: country.demographics.length && country.demographics.length > 0 ? country.demographics[0].population : 0,
                }
            };
            collections.summaryDemographics.save(inputDocument, function (error, data) {
                if (error) {
                    console.log('Error is on insert', error);
                } else
                    console.log(`CRON job to merge collections finished successfully. Data: `, data);
            });
        });
    });
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

client.close();
app.listen(process.env.PORT || 8080);