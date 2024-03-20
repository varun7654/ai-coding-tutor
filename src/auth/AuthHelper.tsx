import {AUTH_API_URL} from "../App";

export function getToken() {
    return localStorage.getItem("token");
}

export function expireToken() {
    localStorage.setItem("token", "expired");
    localStorage.setItem("userName", "");
}

export function getUserName() {
    let username =  localStorage.getItem("userName");
    if (username === null || username === undefined || username === "") {
        return undefined;
    }

    return username;
}

export function isLoggedIn() {
    return getToken() !== undefined && getToken() !== null && getToken() !== "" && getToken() !== "expired";
}

export function logIn(forceLogin = false) {
    localStorage.setItem("loginRedirect", window.location.href);
    if (getToken() === "expired" || forceLogin) {
        window.location.href = AUTH_API_URL;
    }
}