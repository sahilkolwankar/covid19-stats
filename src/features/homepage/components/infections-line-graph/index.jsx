import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { find, has, isEmpty } from 'lodash';
import {
    selectHomepageSummary,
    selectSelectedCountry,
    selectByCountryData,
} from '../../reducer';
import './style.scss';


export const InfectionsLineGraph = () => {
    const selectedCountryData = useSelector(selectByCountryData);
    const selectedCountry = useSelector(selectSelectedCountry);
    const summary = useSelector(selectHomepageSummary);
    const selectedCountrySummary = find(summary, ['CountryCode', selectedCountry]);
    const [data, setData] = useState(null);
    
    useEffect(() => {
        if (selectedCountry && !isEmpty(selectedCountryData) && has(selectedCountryData, selectedCountry)) {
            const graphData = selectedCountryData[selectedCountry];
            setData(graphData);
        }
    }, [selectedCountry, selectedCountryData]);

    return (
        <div className="chartContainer">
            {selectedCountrySummary && selectedCountrySummary.TotalConfirmed === 0 ? (
                <span>There's not enough data for {selectedCountrySummary.Country}</span>
            ) : (
            isEmpty(data) ? (
                <div className="emptyChartContainer">
                    <span>Click on a country to view its graph</span>
                </div>
            ) : (
                    <ResponsiveContainer width="100%" height={385}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="confirmed" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="active" stroke="#82ca9d" />
                            <Line type="monotone" dataKey="recovered" stroke="#ffa500" />
                            <Line type="monotone" dataKey="deaths" stroke="#b90e0a" />
                        </LineChart>
                    </ResponsiveContainer>
            ))}
        </div>
    );
}