import {BrowserRouter as Router, Link, Route, Routes, useLocation} from 'react-router-dom';
import './App.css';
import 'highlight.js/styles/atom-one-dark.min.css';
import LoginButton from "./auth/LoginButton";
import {createTheme, Shadows} from "@mui/material";
import loadable, {DefaultComponent} from "@loadable/component";
import {PrerenderedComponent} from "react-prerendered-component";
import React from "react";
import Terms from "./footer/Terms";

const prerenderedLoadable = (dynamicImport: (props: unknown) => Promise<DefaultComponent<unknown>>) => {
    const LoadableComponent = loadable(dynamicImport);
    return React.memo(props => (
        // you can use the `.preload()` method from react-loadable or react-imported-component`
        // @ts-ignore
        <PrerenderedComponent live={LoadableComponent.load()}>
            <LoadableComponent {...props} />
        </PrerenderedComponent>
    ));
};

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

export function Footer() {
    return (
        <footer className="App-footer ml-5">
            <div className="flex">
                <Link to="/privacy" className="mx-2">Privacy</Link>
                <Link to="/terms" className="mx-2">Terms</Link>
            </div>
        </footer>
    )
}

const Home = prerenderedLoadable(() => import("./Home"));
const LoginSuccess = prerenderedLoadable(() => import("./auth/LoginSuccess"));
const Privacy = prerenderedLoadable(() => import("./footer/Privacy"));

const LoadableProblem = loadable(() => import("./problem/Problem"));


function App() {
    return (
        <Router>
            <div className="App">
                <meta name="viewport" content="initial-scale=1, width=device-width"/>
                <Header/>
                <Routes>
                    <Route path="/" Component={() => <Home/>}/>
                    <Route path="/auth/login_success" Component={() => <LoginSuccess/>}/>
                    <Route path="/privacy" Component={() => <Privacy/>}/>
                    <Route path="/terms" Component={() => <Terms/>}/>
                    <Route path="/problem/*" Component={() =>
                        //@ts-ignore
                        <PrerenderedComponent live={LoadableProblem.load()}>
                            <LoadableProblem/>
                        </PrerenderedComponent>}/>
                </Routes>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;