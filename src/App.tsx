import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'highlight.js/styles/atom-one-dark.min.css';
import {Problem} from "./problem/Problem";
import Home from './Home';
import LoginButton from "./auth/LoginButton";
import LoginSuccess from "./auth/LoginSuccess";
import {createTheme, Shadows} from "@mui/material";

export const API_URL = "https://codehelp.api.dacubeking.com/";
export const AUTH_API_URL = `${API_URL}auth`;

export const buttonTheme = createTheme({
    shadows: Array(25).fill("none") as Shadows,
    palette: {
        primary: {
            main: "#0062cb",
        },
        secondary: {
            main: "#2B2D42",
        },
    },
    typography: {
        fontFamily: "Roboto",
        fontSize: 16,
        button: {
            fontWeight: "bold",
            color: "blue",
        }
    }
});

export const mutedButtonTheme = createTheme({
    shadows: Array(25).fill("none") as Shadows,
    palette: {
        primary: {
            main: "#626c80",
        },
        secondary: {
            main: "#49CA67",
        },
    },
    typography: {
        fontFamily: "Roboto",
        fontSize: 16,
        button: {
            fontWeight: "bold",
            color: "blue",
        }
    }
});


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