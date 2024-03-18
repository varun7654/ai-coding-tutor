import React, {useState} from "react";
import {marked, ProblemData, UserData} from "./Problem";
import DOMPurify from "dompurify";
import {expireToken, getToken, isLoggedIn, logIn} from "../auth/AuthHelper";

export function HelpBox({problemData, getUserData, runTests}: { problemData: ProblemData, getUserData: () => UserData, runTests: () => void}) {
    const [response, setResponse] = useState("");

    function handleHelpRequest() {
        runTests();

        if (!isLoggedIn()) {
            logIn();
            setResponse("You must be logged in to use the AI tutor. Please log in and try again.");
            return;
        }

        let token = getToken();

        console.log(problemData);
        console.log(getUserData());


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

    return (
        <div className="AI-help-area">
            <button onClick={() => {
                handleHelpRequest();
            }} className="Help Button">I'm Stuck
            </button>
            <p className="Code-tutor-response" dangerouslySetInnerHTML={{__html: response}}/>
        </div>
    );
}