import {Marked} from "marked";
import {markedHighlight} from "marked-highlight";
import hljs from "highlight.js/lib/common";
import React, {useEffect, useState} from "react";
import DOMPurify from "dompurify";
import {getEditor} from "./Editor";
import {HelpBoxAndButton} from "./Help";
import {useParams} from "react-router-dom";
import 'katex/dist/katex.min.css';
import {getUserName} from "../auth/AuthHelper";
import {getExpectedResults, TestResult, TestResults, testUserCode} from "./CodeRunner";
import {Button, ThemeProvider} from "@mui/material";
import {buttonTheme, mutedButtonTheme} from "../App";
import markedKatex from "marked-katex-extension";
import {parseProblem, ProblemData} from "./ProblemParse";

hljs.registerAliases([""], {languageName: "javascript"})
export const marked = new Marked(
    markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, {language}).value;
        }
    })
);

const options = {
    throwOnError: false,
    displayMode: false,
};

marked.use(markedKatex(options));

function saveUserData(problemData: ProblemData, userData: UserData) {
    if (userData.currentCode === null || userData.currentCode === "" || userData.currentCode === undefined) {
        console.error("User data is being saved with no code");
    }
    localStorage.setItem(getStorageKey(problemData.id, getUserName()), JSON.stringify(userData));
}

function getStorageKey(id: string, userName: string | undefined) {
    return "problem " + id;
}

export function Problem() {
    const [problemData, setProblemData] = useState(null as unknown as ProblemData);
    const {"*": id} = useParams();
    const [userData, setUserData] = useState(getUserData(id, getUserName()));
    const [helpResponse, setHelpResponse] = useState("");

    function onCodeSubmit() {
        onSubmission(problemData, userData, setUserData);
    }

    useEffect(() => {
        if (id !== undefined) {
            fetch(process.env.PUBLIC_URL + "/problems/" + id + ".md")
                .then(async r => {
                    let text = await r.text()
                    if (!r.ok || !text.startsWith("#")) {
                        throw new Error("Failed to fetch problem data");
                    } else {
                        return text;
                    }
                })
                .then(async text => {
                    let problemData = parseProblem(text, id);

                    // set the template data if the user has not saved any data
                    if (userData.currentCode === null || userData.currentCode === "" || userData.currentCode === undefined) {
                        console.log("First time loading problem, setting template data");
                        if (problemData.displayAbove !== "" && problemData.displayBelow !== "") {
                            userData.currentCode = problemData.displayAbove + "\n\t\n" + problemData.displayBelow;
                        }
                    }

                    if (userData.testResults === undefined || userData.testResults === null || userData.testResults.expectedResults.length === 0) {
                        console.log("First time loading problem, getting expected results");
                        userData.testResults = new TestResults()
                        userData.testResults.expectedResults = getExpectedResults(problemData);

                    }

                    setProblemData(problemData);
                })
                .catch(e => {
                    console.error(e);
                    let problemData = new ProblemData();
                    problemData.title = "Failed to load problem " + id;
                    setProblemData(problemData);
                })
        }
    }, [id]);


    if (problemData === null) {
        if (id !== undefined) {
            return <div>Loading...</div>;
        } else {
            return <div>A problem wasn't specified</div>;
        }
    }

    let descParsed = DOMPurify.sanitize(marked.parse(problemData.preProblemDescription + "\n\n" + problemData.description) as string);

    let testsDisplay = [];
    for (let i = 0; i < problemData.tests.length; i++) {
        testsDisplay.push(getTestElement(problemData.testsDisplay[i],
            userData.testResults.expectedResults[i],
            userData.testResults.returnedResults[i],
            userData.testResults.testResults[i]));
    }

    let testsDisplayJSX = <div>There are no visible test cases</div>;
    if (testsDisplay.length > 0) {
        testsDisplayJSX = <ul className="">
            {testsDisplay.map((test, i) => <li key={i}>{test}</li>)}
        </ul>
    }


    let hiddenTestText: string;
    if (userData.testResults.testResults.length === 0) {
        hiddenTestText = "Hidden tests will be run when you submit your code";
    } else {
        let totalHiddenTests = problemData.hiddenTests.length;
        let hiddenTestsPassed = 0;
        for (let i = 0; i < problemData.hiddenTests.length; i++) {
            if (userData.testResults.testResults[i + problemData.tests.length] === TestResult.Passed) {
                hiddenTestsPassed++;
            }
        }
        hiddenTestText = hiddenTestsPassed + " / " + totalHiddenTests + " hidden tests passed";
    }

    // Callback when the user updates their code
    function updateUserCode(value: string) {
        userData.currentCode = value;
        saveUserData(problemData, userData);
    }

    let errorText: string = ""
    let problemSolved = userData.testResults.testResults.every(result => result === TestResult.Passed) &&
        userData.testResults.testResults.length === userData.testResults.expectedResults.length;

    if (!userData.testResults.ranSuccessfully) {
        if (userData.testResults.parseError !== "") {
            errorText += "We couldn't run your code due to a syntax error on line " + userData.testResults.errorLine + ".\n";
            errorText += indentText(userData.testResults.parseError, 1);
        } else if (userData.testResults.runtimeError !== "") {
            errorText += "Something went wrong trying to run you code"
            if (userData.testResults.errorLine !== -1) {
                errorText += " on line " + userData.testResults.errorLine + ".\n";
            } else {
                errorText += ".\n";
            }
            errorText += indentText(userData.testResults.runtimeError, 1);
        } else {
            console.log(userData.testResults);
            errorText += "No error message was provided."
        }
    }

    errorText = errorText.replace(/\n/g, "<br>");
    errorText = DOMPurify.sanitize(errorText);

    let {helpButton, helpBox} =
        HelpBoxAndButton(problemData, () => userData, onCodeSubmit, helpResponse, setHelpResponse);

    let nextProblem;
    if (problemData.nextProblemId !== "" && problemData.nextProblemId.toLowerCase() !== "nothing") {
        nextProblem = <ThemeProvider theme={mutedButtonTheme}>
            <Button variant="contained"
                    color={problemSolved ? "secondary" : "primary"}
                    href={"/problem/" + problemData.nextProblemId}
                    className={"nextProblemButton"}>
                Next Problem
            </Button>
        </ThemeProvider>
    } else {
        nextProblem = <div/>
    }

    return (
        <div className="ml-5 flex-row">
            <div className="text-7xl font-bold pt-1 pb-5">{problemData.title}</div>
            <div dangerouslySetInnerHTML={{__html: descParsed}}/>
            <div className="flex flex-row justify-between h-auto">
                <div className="w-1/2 h-[calc(100vh*0.80)]">
                    {getEditor(problemData.codeLang, (value) => {
                        updateUserCode(value);
                    }, userData.currentCode)}
                    <div className="pt-2">
                        <SubmitButton onClick={onCodeSubmit}/> {helpButton} {nextProblem}
                    </div>
                </div>
                <div className="w-1/2 pl-4">
                    <div className="text-3xl font-bold w-1/3"> Tests</div>
                    {testsDisplayJSX}
                    <p className="Problem-hidden-tests">
                        {hiddenTestText}
                    </p>
                    <div className="text-error-red" dangerouslySetInnerHTML={{__html: errorText}}/>
                    {helpBox}
                </div>
            </div>
        </div>
    );
}

/**
 * Returns a JSX element for a test case
 */
function getTestElement(test: string, expectedResult: string, actualResult: string, result: TestResult | undefined) {
    let resultText = result === undefined ? "Not Run" : result.toString();
    if (result === TestResult.Failed) {
        resultText += " (Returned: " + actualResult + ")";
    }

    let bgColor = result === TestResult.Passed ? "bg-test-passed" : "bg-test-failed";
    return (
        <p className={"text-black font-bold " + bgColor}>
            {test} {"➔"} {expectedResult} : {resultText}
        </p>
    );
}

/**
 * Returns the text indented by a number of tabs
 */
function indentText(text: string, indent: number) {
    let indentText = "<span style='margin-left: " + (indent * 2) + "em'> </span>";

    return text.split("\n").map(line => indentText + line).join("\n");
}

export class UserData {
    history: string[] = [];
    requestHelpHistory: string[] = [];
    testResults: TestResults = new TestResults();
    lastUpdated: Date = new Date();
    currentCode: string = null as unknown as string;

    constructor(history: string[] = [], requestHelpHistory: string[] = [], testResults: TestResults = new TestResults(), lastUpdated: Date = new Date(), currentCode: string = "") {
        this.history = history;
        this.testResults = testResults;
        this.requestHelpHistory = requestHelpHistory;
        this.lastUpdated = lastUpdated;
        this.currentCode = currentCode;
    }
}

/**
 * Loads the user data from local storage
 * @param id The id of the problem
 * @param userName The username of the user
 */
function getUserData(id: string | undefined, userName: string | undefined) {
    if (id === undefined) {
        console.error("No problem id was specified, so no user data could be retrieved.");
        return new UserData();
    }
    let userData = localStorage.getItem(getStorageKey(id, userName));
    if (userData === null) {
        // try to get the data without the username
        userData = localStorage.getItem(getStorageKey(id, undefined));
        if (userData !== null) {
            console.log("Got user data without username");
        }
    }
    if (userData === null) {
        return new UserData();
    }

    return JSON.parse(userData) as UserData;
}

function SubmitButton({onClick}: { onClick: () => void }) {
    return (
        <ThemeProvider theme={buttonTheme}>
            <Button variant="contained"
                    color="primary"
                    onClick={onClick}
                    className={"submitButton"}
            >
                Test Code
            </Button>
        </ThemeProvider>
    );
}


function onSubmission(problemData: ProblemData, userData: UserData, setUserData: (data: UserData) => void) {
    if (userData.history.length === 0) {
        // First submission
        userData.history.push(userData.currentCode);
    } else {
        let lastSubmission = userData.history[userData.history.length - 1];
        if (lastSubmission !== userData.currentCode) {
            userData.history.push(userData.currentCode);
        }
    }

    userData.lastUpdated = new Date();

    let testResults = testUserCode(userData, problemData);

    let newUserData = new UserData(
        userData.history,
        userData.requestHelpHistory,
        testResults,
        new Date(),
        userData.currentCode
    )

    setUserData(newUserData);
    saveUserData(problemData, newUserData);
}