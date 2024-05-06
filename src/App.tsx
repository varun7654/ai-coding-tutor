import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Link, Route, Routes, useLocation} from 'react-router-dom';
import './App.css';
import 'highlight.js/styles/atom-one-dark.min.css';
import LoginButton from "./auth/LoginButton";
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
    const location = useLocation();

    // Don't show on the home page
    if (location.pathname !== "/") {
        return (
            <span className="App-header">
                <Link to="/" className="wecode-header">WeCode</Link> <LoginButton/>
            </span>
        )
    } else {
        return (
            <></>
        )
    }
}

const Home = lazy(() => import("./Home"));
const Problem = lazy(() => import("./problem/Problem"));
const LoginSuccess = lazy(() => import("./auth/LoginSuccess"));


function App() {
    return (
        <Router>
            <div className="App">
                <meta name="viewport" content="initial-scale=1, width=device-width"/>
                <Header/>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        <Route path="/" Component={Home}/>
                        <Route path="/problem/*" Component={() => <Problem/>}/>
                        <Route path="/auth/login_success" Component={() => <LoginSuccess/>}/>
                    </Routes>
                </Suspense>
            </div>
        </Router>
    );
}

export default App;