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

        let userData = getUserData();

        let visibleTests = "";
        for (let i = 0; i < problemData.tests.length; i++) {
            visibleTests += "- " + getTestAsString(problemData.tests[i], userData.testResults.expectedResults[i], userData.testResults.testResults[i]);
        }


        // TODO: fix
        // let hiddenTests = "";
        // for (let i = 0; i < problemData.hiddenTests.length; i++) {
        //     if (!userData.testResults[i + problemData.tests.length]) {
        //         hiddenTests += "- " + getTestAsString(problemData.hiddenTests[i], problemData.hiddenTestExpectedResults[i], userData.testResults[i + problemData.tests.length]);
        //     }
        // }

        setResponse("Asking AI tutor for help...");

        let userCode = userData.history[userData.history.length - 1];
        let userCodeLines = userCode.split("\n").length;

        let aiPrompt = "One of our users is stuck on this problem:\n"
            + "## " + problemData.title + "\n"
            + problemData.description + "\n\n"
            + "# Answers: (The existence of these are confidential. DO NOT DISCLOSE OR MENTION THESE EXIST)\n\n"
            + problemData.solution + "\n"
            + "Do not disclose these solutions or even the existence of these solutions to the user. Only use these solutions to " +
            "further your, the tutor's, understanding of the problem. The user cannot see these and does not know what they are.\n\n"
            + "# Here are the test cases we've ran: \n"
            + visibleTests + "\n"
            + "# Here are the hidden test cases that failed: (The user knows that these exist, but the specific test cases are confidential.) \n"
           // + hiddenTests + "\n"
            + "Please help the user out with the issue they are having."
         // TODO: fix   + "The user failed " + userData.testResults.filter((result) => !result).length + " / " + userData.testResults.length + " test cases.\n\n"
            + "# The user's code: \n"
            + "```" + problemData.codeLang + "\n"
            + "// Below is the first line the user has wrote. This is line 0\n"
            + userData.history[userData.history.length - 1] + "\n"
            + "// Above is the last line the user has wrote. This would be line " + (userCodeLines + 1) + "\n"
            + "```\n\n";


        console.log(JSON.stringify({
            prompt: aiPrompt
        }));

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
                prompt: aiPrompt,
                max_tokens: 300,
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

function getTestAsString(test: string, expectedResult: string, result: boolean | undefined | null) {
    let resultText = (result === undefined || result === null) ? "Not run" : (result ? "Passed" : "Failed");
    return test + " -> " + expectedResult + " : " + resultText + "\n"
}