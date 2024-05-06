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
import {Button, Popover, ThemeProvider} from "@mui/material";
import {buttonTheme, mutedButtonTheme} from "../App";
import markedKatex from "marked-katex-extension";
import {parseProblem, ProblemData, TestCase} from "./ProblemParse";

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

export function saveUserData(problemData: ProblemData, userData: UserData) {
    if (userData.currentCode === null || userData.currentCode === "" || userData.currentCode === undefined) {
        console.error("User data is being saved with no code");
    }

    localStorage.setItem(getStorageKey(problemData.id, getUserName()), JSON.stringify(userData));
}

function getStorageKey(id: string, userName: string | undefined) {
    return "problem " + id;
}

export default function Problem() {
    const [problemData, setProblemData] = useState(null as unknown as ProblemData);
    const {"*": id} = useParams();
    const [userData, setUserData] = useState(null as unknown as UserData);
    const [helpResponse, setHelpResponse] = useState("When you press \"I'm stuck\", the AI tutor will respond here.");
    const [magicLinksHover, setMagicLinks] = useState({
        anchorEl: null as (HTMLElement | null),
        magicLink: "",
    })

    function onCodeSubmit() {
        return onSubmission(problemData, userData, setUserData);
    }

    let normalizedId = id?.toLowerCase();
    normalizedId?.trim()
    if (normalizedId?.startsWith("/")) {
        normalizedId = normalizedId.substring(1)
    }

    if (normalizedId?.endsWith("/")) {
        normalizedId = normalizedId.substring(0, normalizedId.length - 1)
    }

    useEffect(() => {
        if (normalizedId !== undefined) {
            fetch(process.env.PUBLIC_URL + "/problems/" + normalizedId + ".md")
                .then(async r => {
                    let text = await r.text()
                    if (!r.ok || !text.startsWith("#")) {
                        throw new Error("Failed to fetch problem data");
                    } else {
                        return text;
                    }
                })
                .then(async text => {
                    // @ts-ignore - we've check that the id isn't undefined
                    let problemData = parseProblem(text, normalizedId);
                    let userData = getUserData(normalizedId, getUserName());

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
                    setUserData(userData);
                })
                .catch(e => {
                    console.error(e);
                    let problemData = new ProblemData();
                    problemData.title = "Failed to load problem " + normalizedId;
                    setProblemData(problemData);
                });
        }
    }, [normalizedId]);


    if (problemData === null || userData === null) {
        if (problemData != null && problemData.title !== undefined && problemData.title.startsWith("Failed to load problem") && normalizedId !== undefined) {
            return <div>Failed to load problem {normalizedId}</div>;
        }
        if (normalizedId !== undefined) {
            return <div>Loading...</div>;
        } else {
            return <div>A problem wasn't specified</div>;
        }
    }

    let hljsLang = problemData.codeLang;
    if (hljsLang === "") {
        hljsLang = "plaintext";
    }

    let descParsed = DOMPurify.sanitize(marked.parse(problemData.preProblemDescription + "\n\n" + problemData.description) as string);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, magicLink: string) => {
        setMagicLinks({
            anchorEl: event.currentTarget as HTMLElement,
            magicLink: magicLink
        });
    };

    const handlePopoverClose = () => {
        setMagicLinks({
            anchorEl: null,
            magicLink: magicLinksHover.magicLink
        });
    };

    const open = Boolean(magicLinksHover.anchorEl);


    let testsDisplay = [];

    for (let i = 0; i < problemData.tests.length; i++) {
        testsDisplay.push(getTestElement(problemData.tests[i],
            userData.testResults.expectedResults[i],
            userData.testResults.returnedResults[i],
            userData.testResults.testResults[i],
            handlePopoverOpen, handlePopoverClose));
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
            errorText += "No error message was provided."
        }
    }

    errorText = errorText.replace(/\n/g, "<br>");
    errorText = DOMPurify.sanitize(errorText);

    let {helpButton, helpBox} =
        HelpBoxAndButton(problemData, setUserData, onCodeSubmit, helpResponse, setHelpResponse);

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


    let highlightHover = hljs.highlight(magicLinksHover.magicLink, {language: hljsLang});
    let hoverHtml = DOMPurify.sanitize(highlightHover.value.replace(/\n/g, "<br>"));

    return (
        <div className="ml-5 flex-row">
            <div className="text-7xl font-bold pt-1 pb-5">{problemData.title}</div>
            <div className="w-1/2" dangerouslySetInnerHTML={{__html: descParsed}}/>
            <div className="flex flex-row justify-between h-auto pt-2">
                <div className="w-1/2 h-[calc(100vh*0.80)]">
                    {getEditor(problemData.codeLang, (value) => {
                        updateUserCode(value);
                    }, userData.currentCode)}
                    <div className="pt-2">
                        {nextProblem}
                    </div>
                </div>
                <div className="w-1/2 pl-4 pr-4">
                    <div className="text-3xl font-bold w-1/3"> Tests</div>
                    {testsDisplayJSX}
                    <p className="Problem-hidden-tests">
                        {hiddenTestText}
                    </p>
                    <SubmitButton onClick={onCodeSubmit}/> {helpButton}
                    <div className="text-error-red" dangerouslySetInnerHTML={{__html: errorText}}/>
                    {helpBox}
                </div>
            </div>
            <Popover
                id="mouse-over-popover"
                sx={{
                    pointerEvents: 'none',
                }}
                open={open}
                anchorEl={magicLinksHover.anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <div className="p-2 bg-basically-black text-[#abb2bf]"
                     style={{
                         fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
                         whiteSpace: "pre-wrap",
                     }}
                     dangerouslySetInnerHTML={{__html: hoverHtml}
                     }/>
            </Popover>
        </div>
    );
}

/**
 * Returns a JSX element for a test case
 */
function getTestElement(test: TestCase, expectedResult: string, actualResult: string, result: TestResult | undefined,
                        handlePopoverOpen: (event: React.MouseEvent<HTMLElement>, magicLink: string) => void,
                        handlePopoverClose: () => void) {
    let resultText = result === undefined ? "Not Run" : result.toString();
    if (result === TestResult.Failed) {
        resultText += " (Returned: " + actualResult + ")";
    }

    let bgColor = result === TestResult.Passed ? "bg-test-passed" : "bg-test-failed";

    class MagicLink {
        text: string;
        link: string;

        constructor(text: string, link: string) {
            this.text = text;
            this.link = link;
        }
    }

    let testStringPart: (string | MagicLink)[] = [];

    let testString = test.display;

    for (const entries of test.magicLinks.values()) {
        let key = entries.key;
        let value = entries.value;

        let index = testString.indexOf(key);

        if (index === -1) {
            console.error("Failed to find magic link in test string: " + key);
            continue;
        }
        if (index > 0) {
            testStringPart.push(testString.substring(0, index));
            testString = testString.substring(index);
        }
        testStringPart.push(new MagicLink(key, value));
        testString = testString.substring(key.length);
    }

    testStringPart.push(testString);


    let div = <div className={"mb-2 text-black font-bold pl-1 " + bgColor}>
        {testStringPart.map((part, i) => {
            if (part instanceof MagicLink) {
                return <span key={i} className={"text-purple-800 underline"}
                             onMouseEnter={(e) => handlePopoverOpen(e, part.text + " = " + part.link)}
                             onMouseLeave={handlePopoverClose}>{part.text}</span>
            } else {
                return <span key={i}>{part}</span>
            }
        })}
        <span>
            {" ➔"} {expectedResult} : {resultText}
        </span>
    </div>


    return (
        div
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
    aiRememberResponse: string[] = [];

    constructor(history: string[] = [], requestHelpHistory: string[] = [], testResults: TestResults = new TestResults(), lastUpdated: Date = new Date(), currentCode: string = "", aiRememberResponse: string[] = []) {
        this.history = history;
        this.testResults = testResults;
        this.requestHelpHistory = requestHelpHistory;
        this.lastUpdated = lastUpdated;
        this.currentCode = currentCode;
        this.aiRememberResponse = aiRememberResponse;
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
        userData.currentCode,
        userData.aiRememberResponse
    )
    setUserData(newUserData);
    saveUserData(problemData, newUserData);
    return newUserData;
}