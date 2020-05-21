import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { has, isEmpty } from 'lodash';
import {
    selectHomepageSummary,
    selectByCountryData,
    selectSelectedCountry,
    setSelectedCountry,
    updateCountryData,
} from '../../reducer';
import { Country } from '../../../../types/index';
import './style.scss';

let bodyRowClassName = 'bodyRow';
let flagImagesPath = '/assets/images/svg/';

export const SummaryTable = () => {
    const dispatch = useDispatch();
    const summary = useSelector(selectHomepageSummary);
    const countryData = useSelector(selectByCountryData);
    const selectedCountry = useSelector(selectSelectedCountry);

    const renderRow = (country: Country) => {
        const deathRate = country.TotalConfirmed > 0 ? ((country.TotalDeaths / country.TotalConfirmed) * 100).toFixed(2).toString() + '%' : '-';
        const infectionRate = country.Population ? `${((country.TotalConfirmed / country.Population) * 100).toFixed(5)}%` : '-';
        console.log(country);
        
        const fetchCountryData = () => {
            if (selectedCountry === country.CountryCode) {
                bodyRowClassName.slice(0, -9);
                dispatch(setSelectedCountry(''));
            } else {
                bodyRowClassName += ' selected';
                dispatch(setSelectedCountry(country.CountryCode));
                if (!has(countryData, country.CountryCode)) {
                    fetch(`http://localhost:8080/cases-chart/${country.CountryCode}`)
                        .then(res => res.json())
                        .then(
                            (result) => {
                                if (!isEmpty(result)) dispatch(updateCountryData({ countryCode: country.CountryCode, countryData: result.data }));
                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                console.log(error);
                            }
                        );
                }
            }
        }

        return (
            <div
                className={bodyRowClassName}
                key={country.CountryCode}
                onClick={fetchCountryData}
            >
                <div className='cell countryFlagImageWrapper'>
                    <img
                        className='countryFlagImage'
                        src={`${flagImagesPath}${country.CountryCode.toLowerCase()}.svg`}
                        alt="country flag"
                        width="25px"
                    />
                </div>
                <div className="cell country">{country.Country}</div>
                <div className="cell totalCases">{country.TotalConfirmed}</div>
                <div className="cell totalDeaths">{country.TotalDeaths}</div>
                <div className="cell totalRecovered">{country.TotalRecovered}</div>
                <div className="cell infectionRate">{infectionRate}</div>
                <div className="cell deathRate">{deathRate}</div>
            </div>
        );
    };
    return (
        <div className="summaryTable">
            <div className="headerRow">
                <div className="columnHeader noHeader"></div>
                <div className="columnHeader country">Country</div>
                <div className="columnHeader totalCases">Cases</div>
                <div className="columnHeader totalDeaths">Deaths</div>
                <div className="columnHeader totalRecovered">Recovered</div>
                <div className="columnHeader infectionRate">Infection rate (cases/population)</div>
                <div className="columnHeader deathRate">Death rate (deaths/cases)</div>
            </div>
            <div className="tableBody">
                {summary && summary.map(renderRow)}
            </div>
        </div>
    );
}