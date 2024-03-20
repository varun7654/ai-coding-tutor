import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'highlight.js/styles/atom-one-dark.min.css';
import {Problem} from "./problem/Problem";
import Home from './Home';
import LoginButton from "./auth/LoginButton";
import LoginSuccess from "./auth/LoginSuccess";


export const API_URL = "https://codehelp.api.dacubeking.com/";
export const AUTH_API_URL = `${API_URL}auth`;


export function Header() {
    return (
        <span className = "App-header">
            WeCode <LoginButton />
        </span>
    )
}

function App() {
    return (
        <Router>
            <div className="App">
                <meta name="viewport" content="initial-scale=1, width=device-width"/>
                <Header/>
                <Routes>
                    <Route path="/" Component={Home}/>
                    <Route path="/problem/*" Component={() => <Problem/>}/>
                    <Route path="/auth/login_success" Component={() => <LoginSuccess/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;