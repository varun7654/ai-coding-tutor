import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'highlight.js/styles/atom-one-light.min.css';
import {Problem} from "./problem/Problem";
import Home from './Home';
import Login from "./auth/Login";
import LoginSuccess from "./auth/LoginSuccess";


export const API_URL = "https://codehelp.api.dacubeking.com/";

export const AUTH_API_URL = `${API_URL}auth`;

export function Header() {
    return (
        <h1 className = "App-header">WeCode</h1>
    )
}

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || undefined as string | undefined);
    const [userName, setUserName] = useState(undefined as string | undefined);
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" Component={Home} />
                    <Route path="/problem/:id" Component={() => <Problem />} />
                    <Route path="/auth/login" Component={() => <Login token={token} />} />
                    <Route path="/auth/login_success" Component={() => <LoginSuccess token={token} setToken={setToken} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;