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
}

export function isLoggedIn() {
    return getToken() !== undefined && getToken() !== null && getToken() !== "" && getToken() !== "expired";
}

export function logIn(forceLogin = false) {
    localStorage.setItem("closeWindowAfterLogin", "true");
    if (getToken() === "expired" || forceLogin) {
        window.open(AUTH_API_URL, "_blank");
    } else {
        window.open("/auth/login", "_blank");
    }
}