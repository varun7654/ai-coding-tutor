import React, {useState} from "react";
import {marked, ProblemData, UserData} from "./Problem";
import DOMPurify from "dompurify";
import {expireToken, getToken, isLoggedIn, logIn} from "../auth/AuthHelper";
import {Button, ThemeProvider} from "@mui/material";
import {buttonTheme} from "../App";

export function HelpBoxAndButton(problemData: ProblemData, getUserData: () => UserData, runTests: () => void, response: string, setResponse: (response: string) => void):
    {helpButton: React.JSX.Element, helpBox: React.JSX.Element} {

    function handleHelpRequest() {
        runTests();

        if (!isLoggedIn()) {
            logIn();
            setResponse("You must be logged in to use the AI tutor. Please log in and try again.");
            return;
        }

        let token = getToken();

        fetch("https://codehelp.api.dacubeking.com/ai-tutor", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "user-agent": "cloudflare-worker-ai-tutor-login",
                accept: "application/json",
                "Authorization": `token ${token}`
            },
            body: JSON.stringify({
                problemData: problemData,
                userData: getUserData(),
            })
        })
            .then(response => response.json())
            .then((json: {
                status: number,
                prompt: string,
                response: string,
                expire_logins: boolean,
            }) => {
                if (json.expire_logins) {
                    expireToken();
                    logIn();
                    setResponse("Your login has expired. Please try again after logging in.");
                    return;
                }

                if (json.status === 401) {
                    setResponse("You are not authorized to use the AI tutor.");
                    return;
                }

                if (json.status !== 200) {
                    setResponse("An error occurred while using the AI tutor. Please try again later.");
                    return;
                }

                console.log(json.response);
                console.log(DOMPurify.sanitize(marked.parse(json.response) as string));
                setResponse(DOMPurify.sanitize(marked.parse(json.response) as string));
            });
    }
    let button = (
        <ThemeProvider theme={buttonTheme}>
            <Button variant="contained"
                    color="secondary"
                    onClick={handleHelpRequest}
                    className="helpButton"
                    style={{marginTop: "0.25em"}}>
                I'm stuck!
            </Button>
        </ThemeProvider>
    );

    let helpBox = (
        <div className="AI-help-area">
            <p className="Code-tutor-response" dangerouslySetInnerHTML={{__html: response}}/>
        </div>
    );


    return {
        helpButton: button,
        helpBox: helpBox
    }
}