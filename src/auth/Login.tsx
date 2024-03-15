import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import {AUTH_API_URL} from "../App";



export default function Login({token} : {token: string | undefined}) {
    const [userName, setUserName] = useState(undefined as string | undefined);

    let loggedIn = token !== undefined;

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
            setUserName(login);
        })
        .catch(error => {
            console.error(error);
        });
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
                        Hello there, <span id="login">...</span>.  <LogoutButton />
                    </p>
                </div>
            )
        }
    } else {
        return (
            <div>
                <h1>
                    Login with GitHub
                    <small>Log in</small>
                </h1>
                <p id="signed-out">
                    <a href={AUTH_API_URL}>Login with GitHub</a>
                </p>
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