import React, {useState} from "react";
import {marked, ProblemData, UserData} from "./Problem";
import DOMPurify from "dompurify";

export function HelpBox({problemData, getUserData}: {problemData: ProblemData, getUserData: () => UserData}) {
    const [response, setResponse] =  useState("");
    function handleHelpRequest() {
        let userData = getUserData();

        let visibleTests = "";
        for (let i = 0; i < problemData.tests.length; i++) {
            visibleTests += "- " + getTestAsString(problemData.tests[i], problemData.testExpectedResults[i], userData.testResults[i]);
        }

        let hiddenTests = "";
        for (let i = 0; i < problemData.hiddenTests.length; i++) {
            hiddenTests += "- " + getTestAsString(problemData.hiddenTests[i], problemData.hiddenTestExpectedResults[i], userData.testResults[i + problemData.tests.length]);
        }

        let aiPrompt = "One of our users is stuck on this problem:\n"
        + "## " + problemData.title + "\n"
        + problemData.description + "\n\n"
        + "# Here are some example solutions that we've made: \n\n"
        + problemData.solution + "\n"
        + "Do not disclose these solutions or even the existence of these solutions to the user. Only use these solutions to " +
            "further your understanding of the problem and the issue the user is having.\n\n"
        + "# This is the user's code: \n"
        + "```" + problemData.codeLang + "\n"
        + problemData.displayAbove + "\n"
        + userData.history[userData.history.length - 1] + "\n"
        + problemData.displayBelow + "\n"
        + "```\n\n"
        + "# Here are the test cases we've ran: \n"
        + visibleTests + "\n"
        + "# Here are the hidden test cases (The user knows that these exist, but do not disclose the test cases): \n"
        + hiddenTests + "\n"
        + "Please help the user out with any issues they are having.";

        console.log(aiPrompt);

        setResponse(DOMPurify.sanitize(marked.parse(aiPrompt) as string));
    }

    return (
        <div className="AI-help-area">
            <button onClick={() => {
                handleHelpRequest();
            }} className="Help Button">I'm Stuck</button>
            <p className="Problem-template-code" dangerouslySetInnerHTML={{__html: response}}/>
        </div>
    );
}

function getTestAsString(test: string, expectedResult: string, result: boolean | undefined) {
    let resultText = result === undefined  ? "Not run" : (result ? "Passed" : "Failed");
    return test + " -> " + expectedResult + " : " + resultText + "\n"
}