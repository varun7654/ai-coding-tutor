import {useState} from "react";
import {AUTH_API_URL} from "../App";
import {getToken, isLoggedIn} from "./AuthHelper";

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

    if (loggedIn) {
        if (userName) {
            return (
                <div>
                    <p id="signed-in">
                        Hello there, <span id="login">{userName}</span>. <LogoutButton />
                    </p>
                </div>
            )
        } else {
            return (
                <div>
                    <p id="signed-in">
                        Checking that we've signed you in properly.  <LogoutButton />
                    </p>
                </div>
            )
        }
    } else {
        return (
            <div>
                <h1>
                    You are not logged in. <button onClick={logIn}>Log in</button>
                </h1>
            </div>
        )
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