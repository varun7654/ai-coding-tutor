import {AUTH_API_URL} from "../App";

export function getToken() {
    return localStorage.getItem("token");
}

export function expireToken() {
    localStorage.setItem("token", "expired");
    localStorage.setItem("userName", "");
}

export function getUserName() {
    let userData = localStorage.getItem("userData");
    let username = undefined;
    if (userData !== null) {
        let user = JSON.parse(userData);
        username = user.name;
        if (username === null || username === undefined) {
            username = user.login;
        }
    }

    return username;
}

export function getUserId() {
    let userData = localStorage.getItem("userData");
    let userId = undefined;
    if (userData !== null) {
        let user = JSON.parse(userData);
        userId = user.id;
    }
    return userId;
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