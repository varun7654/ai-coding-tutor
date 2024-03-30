import {useEffect, useState} from "react";
import {AUTH_API_URL} from "../App";
import {getToken, getUserName, isLoggedIn} from "./AuthHelper";
import {Button, createTheme, Shadows, ThemeProvider, Tooltip} from "@mui/material";
import {ReactComponent as GithubLogo} from "./assets/github-logo/github-mark-white.svg";

const theme = createTheme({
    shadows: Array(25).fill("none") as Shadows,
    palette: {
        primary: {
            main: '#000',
        },
        secondary: {
            main: '#fff',
        },
    },
});

export default function LoginButton() {
    const [userName, setUserName] = useState(getUserName());
    let token = getToken();
    let loggedIn = isLoggedIn();
    useEffect(() => {
        if (loggedIn && !userName) {
            // get user info
            fetch("https://api.github.com/user", {
                headers: {
                    accept: "application/vnd.github.v3+json",
                    authorization: `token ${token}`
                }
            })
                .then(response => response.json())
                .then(({login, id, name}) => {
                    let userData = JSON.stringify({login, id, name});
                    if (localStorage.getItem("userData") !== userData && login !== undefined && id !== undefined && name !== undefined) {
                        localStorage.setItem("userData", userData);
                    }
                    setUserName(name);
                })
                .catch(error => {
                    console.error(error);
                });
        }

    }, [loggedIn, token]);

    function logIn() {
        localStorage.setItem("loginRedirect", window.location.href);
        window.location.href = AUTH_API_URL;
    }

    if (!loggedIn) {
        // return a rounded button with the github logo and "Sign in with GitHub"
        return <ThemeProvider theme={theme}>
            <Button variant="contained" color="primary" onClick={logIn}>
                <GithubLogo/> Sign in with GitHub
            </Button>
        </ThemeProvider>

    } else {
        let loggedInText = userName ? `Hey, ${userName}!` : "Finishing Sign In";

        return <ThemeProvider theme={theme}>
            <Tooltip title="Click to sign out">
                <Button variant="outlined"
                        color="secondary"
                        onClick={logout}
                        fullWidth={false}>
                    <GithubLogo style={{width: '2em', height: '2em', paddingRight: "1em"}}/> {loggedInText}
                </Button>
            </Tooltip>
        </ThemeProvider>
    }
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = window.location.href;
}