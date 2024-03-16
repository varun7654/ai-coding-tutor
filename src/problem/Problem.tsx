import {Marked, Token, Tokens} from "marked";
import {markedHighlight} from "marked-highlight";
import hljs from "highlight.js/lib/common";
import React, {useState} from "react";
import DOMPurify from "dompurify";
import {getEditor} from "./Editor";
import Sandbox from "@nyariv/sandboxjs";
import {HelpBox} from "./Help";
import {useParams} from "react-router-dom";
import katex from 'katex';
import 'katex/dist/katex.min.css';

hljs.registerAliases([""], {languageName: "javascript"})
export const marked = new Marked(
    markedHighlight({
        async: false,
        langPrefix: 'hljs lang-',
        highlight: (code, lang, callback) => {
            let highlighted = hljs.highlight(code, {language: lang});
            return highlighted.value;
        }
    })
);

marked.use({
    renderer: {
        text: function(text) {
            return text.replace(/\$(.*?)\$/g, function(_, latex) {
                return katex.renderToString(latex, {
                    throwOnError: false
                });
            });
        }
    }
});

let userCode = "";

export function Problem() {
    const [problemData, setProblemData] = useState(null as unknown as ProblemData);
    const [userData, setUserData] = useState(new UserData());
    const { "*" : id } = useParams();

    function onCodeSubmit() {
        onSubmission(problemData, userData, setUserData);
    }

    function extractTestCases(tokens: Token[], tests: string[], testExpectedResults: string[]) {
        // Tests are formatted as a list of functions in a code block with the expected result below it
        while (tokens.length > 0) {
            absorbWhitespace(tokens);
            if (tokens.length === 0 || tokens[0].type !== "code") break;
            let test = tokens.shift() as Tokens.Code;

            absorbWhitespace(tokens);
            // @ts-ignore - ts seems to not believe that type could be paragraph
            if (tokens.length === 0 || tokens[0].type !== "paragraph") break;
            let expectedResult = tokens.shift() as Tokens.Paragraph;

            tests.push(test.text);
            testExpectedResults.push(expectedResult.text);
        }
    }

    if (problemData === null && id !== undefined) {
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
                let problem = tokens.shift() as Tokens.Code;
                let splitProblem = problem.text.split("// Your code here");
                let codeLang = problem.lang ? problem.lang : "javascript";

                let displayAbove = splitProblem[0].trim();
                let displayBelow = splitProblem[1].trim();

                removeNextHeading(tokens); // Remove the solution heading
                absorbWhitespace(tokens);
                let solution = "";
                while (tokens.length > 0 && !(tokens[0].type === "heading" && (tokens[0] as Tokens.Heading).depth <= 1)) {
                    solution += ((tokens.shift() as Token).raw);
                }

                removeNextHeading(tokens); // Remove the tests heading
                let tests: string[] = [];
                let testExpectedResults: string[] = [];
                extractTestCases(tokens, tests, testExpectedResults);

                removeNextHeading(tokens); // Remove the hidden tests heading
                let hiddenTests: string[] = [];
                let hiddenTestExpectedResults: string[] = [];
                extractTestCases(tokens, hiddenTests, hiddenTestExpectedResults);

                removeNextHeading(tokens); // Remove the hidden tests heading
                let nextProblemId = (tokens.shift() as Tokens.Paragraph).text;

                setProblemData({
                    title,
                    preProblemDescription,
                    description,
                    tests,
                    testExpectedResults,
                    hiddenTests,
                    hiddenTestExpectedResults,
                    displayAbove,
                    displayBelow,
                    solution,
                    codeLang,
                    nextProblemId
                });
            })
            .catch(e => {
                console.error(e);
                let problemData = new ProblemData();
                problemData.title = "Failed to load problem " + id;
                setProblemData(problemData);
            })
    }

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
        testsDisplay.push(getTestElement(problemData.tests[i], problemData.testExpectedResults[i], userData.testResults[i]));
    }

    let testsDisplayJSX = <div>There are no visible test cases</div>;
    if (testsDisplay.length > 0) {
        testsDisplayJSX = <ul>
            {testsDisplay.map((test, i) => <li key={i}>{test}</li>)}
        </ul>
    }




    let hiddenTestText: string;
    if (userData.testResults.length === 0) {
        hiddenTestText = "Hidden tests will be run when you submit your code";
    } else {
        let totalHiddenTests = problemData.hiddenTests.length;
        let hiddenTestsPassed = 0;
        for (let i = 0; i < problemData.hiddenTests.length; i++) {
            if (userData.testResults[i + problemData.tests.length]) {
                hiddenTestsPassed++;
            }
        }
        hiddenTestText = hiddenTestsPassed + " / " + totalHiddenTests + " hidden tests passed";
    }

    let defaultTextBoxVal = problemData.displayAbove + "\n\n" + problemData.displayBelow;

    return (
        <div className="Problem">
            <h1 className="Problem-title">{problemData.title}</h1>
            <div className="Problem-desc" dangerouslySetInnerHTML={{__html: descParsed}}/>
            <div className="Problem-Code">
                {getEditor(problemData.codeLang, (value) => {userCode = value;}, defaultTextBoxVal)}
                <SubmitButton onClick={onCodeSubmit} />
            </div>
            <div className="Problem-test-results">
                <h3>Tests</h3>
                {testsDisplayJSX}
                <p className="Problem-hidden-tests">
                    {hiddenTestText}
                </p>
            </div>
            <HelpBox problemData={problemData} getUserData={() => userData} runTests={onCodeSubmit}/>
            <button onClick={() => {
                window.location.href = "/problem/" + problemData.nextProblemId;
            }}>Next Problem</button>
        </div>
    );
}

function getTestElement(test: string, expectedResult: string, result: boolean | undefined) {
    let resultText = result === undefined  ? "Not run" : (result ? "Passed" : "Failed");
    return (
        <p className={"Test-" + resultText.toLowerCase()}>
            {test} {"->"} {expectedResult} : {resultText}
        </p>
    );
}

export class ProblemData {
    title: string = 'Loading...';
    preProblemDescription: string = "";
    description: string = "";
    tests: string[] = [];
    testExpectedResults: string[] = []
    hiddenTests: string[] = []
    hiddenTestExpectedResults: string[] = [];
    displayAbove: string = "";
    displayBelow: string = "";
    solution: string = "";
    codeLang: string = "";
    nextProblemId: string = "";
}

export class UserData {
    history: string[] = [];
    requestHelpHistory: string[] = [];
    testResults: boolean[] = [];

    constructor(history: string[] = [], requestHelpHistory: string[] = [],  testResults: boolean[] = []) {
        this.history = history;
        this.testResults = testResults;
        this.requestHelpHistory = requestHelpHistory;
    }
}

function SubmitButton({onClick} : {onClick: () => void}){
    return (
        <button onClick={() => {
            onClick();
        }}>Test Code</button>
    );
}

function onSubmission(problemData: ProblemData, userData: UserData, setUserData: (data: UserData) => void) {
    if (userData.history.length === 0) {
        // First submission
        userData.history.push(userCode);
    } else {
        let lastSubmission = userData.history[userData.history.length - 1];
        if (lastSubmission !== userCode) {
            userData.history.push(userCode);
        }
    }


    const scope: {results: any[]} = {results: []};

    let userRunnableCode = userCode + "\n";

    let combinedTests = problemData.tests.concat(problemData.hiddenTests);

    const prototypeWhitelist = Sandbox.SAFE_PROTOTYPES;
    // fix the ** operator not being allowed
    // @ts-ignore
    console.log(prototypeWhitelist);

    const globals = {...Sandbox.SAFE_GLOBALS};

    const sandbox = new Sandbox({globals, prototypeWhitelist});

    for (let i = 0; i < combinedTests.length; i++) {
        let testSplitIntoLines = combinedTests[i].split("\n");

        let testCode = testSplitIntoLines.slice(0, -1).join("\n"); // run all but the last line
        testCode += "let result" + i + " = " + testSplitIntoLines[testSplitIntoLines.length - 1]; // Run the test and store the result
        testCode += "\nresults.push(result" + i + ");"; // Push the result to the result array
        userRunnableCode += "\n{\n" + testCode + "\n}\n"; // Wrap the test in a block to avoid variable name conflicts
    }
    try {
        const exec = sandbox.compile(userRunnableCode);
        exec(scope).run();
    } catch (e) {
        console.error(e);
        console.log("Code that resulted in error: ", userRunnableCode)
        return;
    }

    let testResults: boolean[] = [];

    for (let i = 0; i < combinedTests.length; i++) {
        let result = scope.results[i];
        if (result === undefined) {
            result = "undefined";
        } else if (result === null) {
            result = "null";
        }


        let expectedResult : string;
        if (i < problemData.tests.length) {
            expectedResult = problemData.testExpectedResults[i];
        } else {
            expectedResult = problemData.hiddenTestExpectedResults[i - problemData.tests.length];
        }
        let testPassed = result.toString() === expectedResult;
        // console.log(result.toString(), "===", expectedResult, testPassed);
        testResults.push(testPassed);
    }

    setUserData(new UserData(
        userData.history,
        userData.requestHelpHistory,
        testResults
    ));
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