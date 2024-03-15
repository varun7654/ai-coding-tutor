import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'highlight.js/styles/atom-one-light.min.css';
import {Problem} from "./problem/Problem";
import Home from './Home'; // import the Home component

export function Header() {
    return (
        <h1 className = "App-header">WeCode</h1>
    )
}

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/problem/:id" element={<Problem />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;