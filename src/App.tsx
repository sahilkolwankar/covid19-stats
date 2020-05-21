import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
// import { Counter } from './features/counter/Counter';
import { Homepage } from './features/homepage/Homepage';
import './App.scss';

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/">
                    <Homepage />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
