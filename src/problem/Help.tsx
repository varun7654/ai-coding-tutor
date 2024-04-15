import React from "react";
import {marked, saveUserData, UserData} from "./Problem";
import DOMPurify from "dompurify";
import {expireToken, getToken, isLoggedIn, logIn} from "../auth/AuthHelper";
import {Button, ThemeProvider} from "@mui/material";
import {buttonTheme} from "../App";
import {ProblemData, removeNextHeading} from "./ProblemParse";
import {Token, Tokens} from "marked";


export const LOADING_MESSAGE = "Requesting help from the AI tutor...";

export function HelpBoxAndButton(problemData: ProblemData,
                                 setUserData: (userData: UserData) => void,
                                 runTests: () => UserData,
                                 response: string,
                                 setResponse: (response: string) => void):
    { helpButton: React.JSX.Element, helpBox: React.JSX.Element } {

    function handleHelpRequest(event: React.MouseEvent<HTMLButtonElement>) {
        event.currentTarget.setAttribute("disabled", "true");

        let userData = runTests();
        if (!isLoggedIn()) {
            setResponse("You must be logged in to use the AI tutor. Please log in and try again.");
            return;
        }

        let token = getToken();
        let target = event.currentTarget;
        setResponse(LOADING_MESSAGE);
        fetch("https://codehelp.api.dacubeking.com/ai-tutor", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "user-agent": "WeCode/1.0.0",
                accept: "application/json",
                "Authorization": `token ${token}`
            },
            body: JSON.stringify({
                problemData: problemData,
                userData: userData,
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

                let tokens = marked.lexer(json.response);
                // There are two sections: # Thinking out loud and # My Response
                // We want to display the My Response section

                // Remove Thinking out loud
                removeNextHeading(tokens, "Thinking out loud");
                // Remove the My Response heading
                removeNextHeading(tokens, "My Response");

                // Collect everything under the My Response heading
                let response = "";
                while (tokens.length > 0 && (tokens[0].type !== "heading" || (tokens[0] as Tokens.Heading).depth > 1 || (tokens[0] as Tokens.Heading).text.trim() !== "Remembering")) {
                    response += ((tokens.shift() as Token).raw);
                }

                removeNextHeading(tokens, "Remembering"); // Remove the Remembering heading
                let rememberingResponse = "";
                while (tokens.length > 0) {
                    rememberingResponse += ((tokens.shift() as Token).raw);
                }

                let newUserData = {
                    ...userData,
                    aiRememberResponse: userData.aiRememberResponse.concat(rememberingResponse),
                }

                setUserData(
                    newUserData
                );

                saveUserData(problemData, newUserData);
                setResponse(DOMPurify.sanitize(marked.parse(response) as string));
                target.removeAttribute("disabled");
            })
            .catch((error) => {
                console.error(error);
                setResponse("An error occurred while using the AI tutor. Please try again later.");
                target.removeAttribute("disabled");
            });
    }

    let button = (
        <ThemeProvider theme={buttonTheme}>
            <Button variant="contained"
                    color="secondary"
                    onClick={handleHelpRequest}
                    className="helpButton"
            >
                I'm stuck!
            </Button>
        </ThemeProvider>
    );

    let helpBox = (
        <div className="AI-help-area border-2  p-2 mt-2 mr-2 border-white-pink w-full min-h-20">
            <p className="Code-tutor-response" dangerouslySetInnerHTML={{__html: response}}/>
        </div>
    );


    return {
        helpButton: button,
        helpBox: helpBox
    }
}