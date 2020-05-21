import React from 'react';
import { useSelector } from 'react-redux';
import { find, get, isEmpty } from 'lodash';
import {
    selectHomepageSummary,
    selectSelectedCountry,
} from '../../reducer';
import './style.scss';

export const AggregateData = () => {
    const selectedCountryCode = useSelector(selectSelectedCountry);
    const summary = useSelector(selectHomepageSummary);
    const selectedCountrySummary = find(summary, ['CountryCode', selectedCountryCode]);
    const totalConfirmed = get(selectedCountrySummary, 'TotalConfirmed', 0);
    const newConfirmed = get(selectedCountrySummary, 'NewConfirmed', 0);
    const totalDeaths = get(selectedCountrySummary, 'TotalDeaths', 0);
    const newDeaths = get(selectedCountrySummary, 'NewDeaths', 0);
    const totalRecovered = get(selectedCountrySummary, 'TotalRecovered', 0);
    const newRecovered = get(selectedCountrySummary, 'NewRecovered', 0);
    const population = get(selectedCountrySummary, 'population', 0);
    const getDeathRate = () => ((totalDeaths / totalConfirmed) * 100).toFixed(2);
    const getPopulationInfectionRate = () => population ? `${((totalConfirmed / population) * 100).toFixed(5)}%` : 'Unknown';

    const renderCountryData = () => (
        <div className="countryDataWrapper">
            <div className="countryOverview">
                <span className="countryName">{selectedCountrySummary?.Country}</span>
                <span className="countryDeathRate">Death rate: {totalConfirmed > 0 ? `${getDeathRate()}%` : '?'}</span>
                <span className="countryDeathRate">Infection rate: {getPopulationInfectionRate()} of the population</span>
            </div>
            <div className="derivedStats">
                {totalConfirmed > 0 ? (
                    <>
                        <span>Death rate as per reported data: {getDeathRate()}%</span>
                        <span>{getPopulationInfectionRate()} of the population is infected by the SARS-CoV-2</span>
                    </>
                ) : (
                        <span>Not enough data to show derived statistics</span>
                    )}
            </div>
            <div className="organicStats">
                <span>Cases reported: </span><span>Today: {newConfirmed}</span><span>Total: {totalConfirmed}</span>
                <span>Deaths reported: </span><span>Today: {newDeaths}</span><span>Total: {totalDeaths}</span>
                <span>Recoveries reported: </span><span>Today: {newRecovered}</span><span>Total: {totalRecovered}</span>
            </div>
        </div>
    );

    return (
        <div className="wrapper">
            {isEmpty(selectedCountrySummary) ? (
                'Click on a country to view its aggregate data'
            ) : (
                    renderCountryData()
                )}
        </div>
    );
}