import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'highlight.js/styles/atom-one-light.min.css';
import {Problem} from "./problem/Problem";
import Home from './Home'; // import the Home component

export function Header() {
    return (
        <h1 className = "App-header">Header</h1>
    )
}

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" Component={Home} />
                    <Route path="/problem" Component={() => <Problem id={window.location.href + ".md"} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;