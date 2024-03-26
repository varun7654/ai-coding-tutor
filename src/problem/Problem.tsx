import {Marked, Token, Tokens} from "marked";
import {markedHighlight} from "marked-highlight";
import hljs from "highlight.js/lib/common";
import React, {useEffect, useState} from "react";
import DOMPurify from "dompurify";
import {getEditor} from "./Editor";
import {HelpBoxAndButton} from "./Help";
import {useParams} from "react-router-dom";
import 'katex/dist/katex.min.css';
import {getUserName} from "../auth/AuthHelper";
import {getExpectedResults, TestResult, TestResults, testUserCode} from "./codeRunner";
import {Button, ThemeProvider} from "@mui/material";
import {buttonTheme, mutedButtonTheme} from "../App";
import markedKatex from "marked-katex-extension";

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

export function Problem() {
    const [problemData, setProblemData] = useState(null as unknown as ProblemData);
    const {"*": id} = useParams();
    const [userData, setUserData] = useState(getUserData(id, getUserName()));
    const [helpResponse, setHelpResponse] = useState("");

    function onCodeSubmit() {
        onSubmission(problemData, userData, setUserData);
    }

    useEffect(() => {
        function extractTestCases(tokens: Token[], tests: string[]) {
            // Tests are formatted as a list of functions in a code block with the expected result below it
            while (tokens.length > 0) {
                absorbWhitespace(tokens);
                if (tokens.length === 0 || tokens[0].type !== "code") break;
                let test = tokens.shift() as Tokens.Code;

                absorbWhitespace(tokens);
                // @ts-ignore - ts seems to not believe that type could be paragraph
                if (tokens.length === 0 || tokens[0].type === "paragraph") {
                    let str = (tokens.shift() as Tokens.Paragraph).text.trim().toLowerCase(); // Remove the expected result (not used anymore)
                    // check if it begins with "repeat =" or "repeat="
                    if (str.startsWith("repeat")) {
                        if (str.startsWith("repeat =")) {
                            str = str.substring(8);
                        } else if (str.startsWith("repeat=")) {
                            str = str.substring(7);
                        } else {
                            console.error("Failed to parse repeat value: " + str);
                        }

                        let num = parseInt(str);
                        if (isNaN(num)) {
                            console.error("Failed to parse repeat value: " + str);
                        } else {
                            for (let i = 0; i < num - 1; i++) { // Add the test case the number of times specified (minus 1 to account for the original)
                                tests.push(test.text);
                            }
                        }
                    }


                }

                tests.push(test.text);
            }
        }

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
                    let tokens = marked.lexer(text);
                    let title = (tokens.shift() as Tokens.Heading).text;

                    let preProblemDescription = "";
                    removeTillNextType(tokens, "heading"); // Collect everything under the description heading
                    if ((tokens[0] as Tokens.Heading).text === "Context") {
                        tokens.shift();
                        while (tokens.length > 0 && (tokens[0].type !== "heading" || (tokens[0] as Tokens.Heading).depth > 1)) {
                            preProblemDescription += ((tokens.shift() as Token).raw);
                        }
                    }

                    // Collect everything under the description heading
                    removeNextHeading(tokens); // Remove the description heading

                    let description = "";
                    while (tokens.length > 0 && (tokens[0].type !== "heading" || (tokens[0] as Tokens.Heading).depth > 1)) {
                        description += ((tokens.shift() as Token).raw);
                    }

                    removeNextHeading(tokens); // Remove the problem heading
                    if (tokens[0].type !== "code") {
                        console.error("Problem Parse: No code block found after problem heading. If no template code is needed, please use a code block with no content (with the correct language).");
                    }
                    let problem = tokens.shift() as Tokens.Code;
                    if (!problem.lang) {
                        console.error("Problem Parse: No code language specified for problem " + id);
                    }
                    let codeLang = problem.lang ? problem.lang : "javascript";

                    let splitProblem = problem.text.split("// Your code here");

                    let displayAbove;
                    let displayBelow;

                    if (splitProblem.length === 0 || splitProblem[0].trim() === "") {
                        console.log("Problem Parse: Code block has no content");
                        displayAbove = "";
                        displayBelow = "";
                    } else {
                        displayAbove = splitProblem[0].trim();
                        if (splitProblem.length === 1) {
                            displayBelow = "";
                            console.error("Problem Parse: No secondary display content found in problem " + id +
                                ". It is unlikely that this is intentional. Ensure that you have a comment with the text '// Your code here' in the problem description.");
                        } else {
                            displayBelow = splitProblem[1].trim();
                        }
                    }


                    removeNextHeading(tokens); // Remove the solution heading
                    absorbWhitespace(tokens);
                    let solution = "";
                    let solutionCode = "";
                    while (tokens.length > 0 && !(tokens[0].type === "heading" && (tokens[0] as Tokens.Heading).depth <= 1)) {
                        if (tokens[0].type === "code" && solutionCode === "") {
                            // Get the first code block as the solution code
                            solutionCode += (tokens[0] as Tokens.Code).text;
                        }
                        solution += ((tokens.shift() as Token).raw);
                    }

                    removeNextHeading(tokens); // Remove the tests heading
                    let tests: string[] = [];
                    extractTestCases(tokens, tests);

                    removeNextHeading(tokens); // Remove the hidden tests heading
                    let hiddenTests: string[] = [];
                    extractTestCases(tokens, hiddenTests);

                    removeNextHeading(tokens); // Remove the hidden tests heading
                    let nextProblemId = (tokens.shift() as Tokens.Paragraph).text;

                    let problemData = {
                        id,
                        title,
                        preProblemDescription,
                        description,
                        tests,
                        hiddenTests,
                        displayAbove,
                        displayBelow,
                        solution,
                        solutionCode,
                        codeLang,
                        nextProblemId
                    }

                    // set the template data if the user has not saved any data
                    if (userData.currentCode === null || userData.currentCode === "" || userData.currentCode === undefined) {
                        console.log("First time loading problem, setting template data");
                        if (displayAbove !== "" && displayBelow !== "") {
                            userData.currentCode = displayAbove + "\n\t\n" + displayBelow;
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

    let hljsLang = problemData.codeLang;

    if (hljs.getLanguage(hljsLang) === undefined) {
        hljsLang = "javascript";
    }

    let descParsed = DOMPurify.sanitize(marked.parse(problemData.preProblemDescription + "\n\n" + problemData.description) as string);

    let testsDisplay = [];
    for (let i = 0; i < problemData.tests.length; i++) {
        testsDisplay.push(getTestElement(problemData.tests[i],
            userData.testResults.expectedResults[i],
            userData.testResults.testResults[i]));
    }

    let testsDisplayJSX = <div>There are no visible test cases</div>;
    if (testsDisplay.length > 0) {
        testsDisplayJSX = <ul>
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
        <div className="Problem">
            <h1 className="Problem-title">{problemData.title}</h1>
            <div className="Problem-desc" dangerouslySetInnerHTML={{__html: descParsed}}/>
            <div className="Problem-Code">
                {getEditor(problemData.codeLang, (value) => {
                    updateUserCode(value);
                }, userData.currentCode)}
                <SubmitButton onClick={onCodeSubmit}/> {helpButton}
            </div>
            {helpBox}
            <div className="Problem-error" dangerouslySetInnerHTML={{__html: errorText}}/>
            <div className="Problem-test-results">
                <h3>Tests</h3>
                {testsDisplayJSX}
                <p className="Problem-hidden-tests">
                    {hiddenTestText}
                </p>
            </div>
            {nextProblem}
        </div>
    );
}

function getTestElement(test: string, expectedResult: string, result: TestResult | undefined) {
    let resultText = result === undefined ? "Not Run" : result.toString();
    return (
        <p className={"Test-" + resultText.toLowerCase()}>
            {test} {"->"} {expectedResult} : {resultText}
        </p>
    );
}

function indentText(text: string, indent: number) {
    let indentText = "<span style='margin-left: " + (indent * 2) + "em'> </span>";

    return text.split("\n").map(line => indentText + line).join("\n");
}

export class ProblemData {
    id: string = "";
    title: string = 'Loading...';
    preProblemDescription: string = "";
    description: string = "";
    tests: string[] = [];
    hiddenTests: string[] = []
    displayAbove: string = "";
    displayBelow: string = "";
    solution: string = "";
    solutionCode: string = "";
    codeLang: string = "";
    nextProblemId: string = "";
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

function getStorageKey(id: string, userName: string | undefined) {
    return "problem " + id;
}

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
                    style={{marginTop: "0.25em"}}>
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

function removeNextHeading(tokens: Token[]) {
    removeNextType(tokens, "heading");
}

function removeTillNextType(tokens: Token[], type: string) {
    while (tokens.length > 0 && tokens[0].type !== type) {
        tokens.shift();
    }
}

function removeNextType(tokens: Token[], type: string) {
    while (tokens.length > 0 && tokens[0].type !== type) {
        tokens.shift();
    }
    tokens.shift();
}

function absorbWhitespace(tokens: Token[]) {
    while (tokens.length > 0 && tokens[0].type === "space") {
        tokens.shift();
    }
}