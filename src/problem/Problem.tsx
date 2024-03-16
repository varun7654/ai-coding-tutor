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
            let trimmed = text.trim();
            if (trimmed.startsWith('$') && trimmed.endsWith('$')) {
                console.log("Rendering latex: " + text);
                const latex = trimmed.slice(1, -1);
                return katex.renderToString(latex, {
                    throwOnError: false
                });
            } else {
                console.log("Rendering text: " + text);
            }
            return text;
        }
    }
});

let userCode = "";

export function Problem() {
    const [problemData, setProblemData] = useState(null as unknown as ProblemData);
    const [userData, setUserData] = useState(new UserData());
    const { id } = useParams();

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

                // Collect everything under the description heading
                removeNextHeading(tokens); // Remove the description heading

                let description = "";
                while (tokens.length > 0 && tokens[0].type !== "heading") {
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

                setProblemData({
                    title,
                    description,
                    tests,
                    testExpectedResults,
                    hiddenTests,
                    hiddenTestExpectedResults,
                    displayAbove,
                    displayBelow,
                    solution,
                    codeLang
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

    let descParsed = DOMPurify.sanitize(marked.parse(problemData.description) as string);
    let displayAboveParsed = DOMPurify.sanitize(hljs.highlight(problemData.displayAbove, {language: hljsLang}).value);
    let displayBelowParsed = DOMPurify.sanitize(hljs.highlight(problemData.displayBelow, {language: hljsLang}).value);
    let solutionParsed = DOMPurify.sanitize(marked.parse(problemData.solution) as string);

    let testsDisplay = [];
    for (let i = 0; i < problemData.tests.length; i++) {
        testsDisplay.push(getTestElement(problemData.tests[i], problemData.testExpectedResults[i], userData.testResults[i]));
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

    return (
        <div className="Problem">
            <h1 className="Problem-title">{problemData.title}</h1>
            <div className="Problem-desc" dangerouslySetInnerHTML={{__html: descParsed}}/>
            <div className="Problem-Code">
                <pre className="Problem-template-code" dangerouslySetInnerHTML={{__html: displayAboveParsed}}/>
                {getEditor(problemData.codeLang, (value) => {userCode = value;})}
                <pre className="Problem-template-code" dangerouslySetInnerHTML={{__html: displayBelowParsed}}/>
                <SubmitButton onClick={onCodeSubmit} />
            </div>
            <h1>Solution</h1>
            <div className="Problem-solution" dangerouslySetInnerHTML={{__html: solutionParsed}} />
            <div className="Problem-test-results">
                <h3>Tests</h3>
                <ul>
                    {testsDisplay.map((test, i) => <li key={i}>{test}</li>)}
                </ul>
                <p className="Problem-hidden-tests">
                    {hiddenTestText}
                </p>
            </div>
            <HelpBox problemData={problemData} getUserData={() => userData} runTests={onCodeSubmit}/>
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
    description: string = "";
    tests: string[] = [];
    testExpectedResults: string[] = []
    hiddenTests: string[] = []
    hiddenTestExpectedResults: string[] = [];
    displayAbove: string = "";
    displayBelow: string = "";
    solution: string = "";
    codeLang: string = "";
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

    const sandbox = new Sandbox();

    const scope: {results: any[]} = {results: []};

    let userRunnableCode = problemData.displayAbove + "\n"
        + userCode + "\n"
        + problemData.displayBelow
    + "\n";

    let combinedTests = problemData.tests.concat(problemData.hiddenTests);

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
        // TODO: Handle error and display to user
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