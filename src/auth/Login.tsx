import {useState} from "react";
import {AUTH_API_URL} from "../App";
import {getToken, isLoggedIn} from "./AuthHelper";
import {Button} from "@mui/material";

export default function Login() {
    const [userName, setUserName] = useState(undefined as string | undefined);

    let token = getToken();
    console.log("Token: " + token);
    let loggedIn = isLoggedIn();

    if (loggedIn) {
        // get user info
        fetch("https://api.github.com/user", {
            headers: {
                accept: "application/vnd.github.v3+json",
                authorization: `token ${token}`
            }
        })
        .then(response => response.json())
        .then(({login}) => {
            console.log("Username: " + login);
            setUserName(login);
            if (localStorage.getItem("userName") !== login) {
                localStorage.setItem("userName", login);
            }

            if (localStorage.getItem("closeWindowAfterLogin") === "true") {
                localStorage.setItem("closeWindowAfterLogin", "false");
                window.close();
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    function logIn() {
        window.location.href = AUTH_API_URL;
    }

    let loggedInText = loggedIn ? (userName ? `Hello there, ${userName}.` : "Finishing Sign In.") : "You are not logged in.";
    if (!loggedIn || true) {
        // return a rounded button with the github logo and "Sign in with GitHub"
        return <Button variant="contained">Hello world</Button>;

    } else {

    }
}

export function logout() {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
}

export function LogoutButton() {
    return (
        <button onClick={logout}>Logout</button>
    )
}