import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { updateSummary } from './reducer';
import { SummaryTable } from './components/summary-table/index';
import { InfectionsLineGraph } from './components/infections-line-graph/index';
import { AggregateData } from './components/aggregate-data/index';
import './style.scss';

export function Homepage() {
    const dispatch = useDispatch();
    let location = useLocation();

    useEffect(() => {
        fetch("http://localhost:8080/summary")
            .then(res => res.json())
            .then(
                (result) => {
                    dispatch(updateSummary(result));
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error);
                }
            )
    }, [location.pathname]);

    return (
        <div className="appWrapper">
            <InfectionsLineGraph />
            <SummaryTable />
            {/* <AggregateData /> */}
        </div>
    );
}
