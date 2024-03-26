import {ProblemData, UserData} from "./Problem";

const functionHeaderOffset = 2;

export enum TestResult {
    Passed = "Passed",
    Failed = "Failed",
    Exception = "Exception",
    NotRun = "Not run"
}

export class TestResults {
    public testResults: TestResult[] = [];
    public returnedResults: string[] = [];
    public expectedResults: string[] = [];
    public parseError: string = "";
    public errorLine: number = -1;
    public runtimeError: string = "";
    public output: string = "";
    public ranSuccessfully: boolean = true; // Prevents the user from seeing an error message on first load
}

class StringLineNum {
    public str: string;
    public lineNum: number;

    constructor(str: string, lineNum: number) {
        this.str = str;
        this.lineNum = lineNum;
    }
}

// Function to tokenize a JavaScript function signature
function tokenizeFunctionSignature(signature: string): StringLineNum[] {
    let tokens: StringLineNum[] = [];
    let lineNum = 1;

    const tokenChars = [' ', '(', ')', '{', '}', ':', ',', ';', '\n'];


    let bufferStartIndex = 0;
    for (let i = 0; i < signature.length; i++) {
        if (tokenChars.includes(signature[i])) {
            if (bufferStartIndex !== i) {
                tokens.push(new StringLineNum(signature.substring(bufferStartIndex, i), lineNum));
            }
            // We also need to add the token character as a separate token.
            // Don't add a token for a space character.
            // Don't add a token for a new line character
            // (but if we haven't seen a semicolon, on a line with content, add a token).
            if (signature[i] !== ' ' && signature[i] !== '\n') {
                tokens.push(new StringLineNum(signature[i], lineNum));
            }

            if (signature[i] === '\n') {
                lineNum++;
            }

            bufferStartIndex = i + 1;
        }
    }

    // Filter out any empty tokens
    return tokens.filter(token => token.str !== "");
}

function reformatStackTrace(result: Error, userCodeLineNumberBegin: number, userCodeLineNumberEnd: number) {
    let stackTrace = result.stack;
    if (stackTrace === undefined) {
        stackTrace = "";
    }
    let stackTraceLines = stackTrace.split('\n');
    // discard after when the line begins with "at testUserCode"
    for (let j = 0; j < stackTraceLines.length; j++) {
        let thisLine = stackTraceLines[j].trim();
        if (thisLine.startsWith("at testUserCode") || thisLine.startsWith("at Function") || thisLine.startsWith("at eval")) {
            stackTraceLines = stackTraceLines.slice(0, j);
            break;
        }
    }

    const regex = /eval\s+at\s+\w+\s+\(https?:\/\/[^)]+\),\s+<anonymous>:/g;

    // remove the (eval at testUserCode (url) <anonymous:) part (keep the line number/col number)
    for (let j = 0; j < stackTraceLines.length; j++) {
        stackTraceLines[j] = stackTraceLines[j].replace(regex, "");
    }

    let errorLine = -1

    // Find the line number of the error & adjust line numbers to match the user's code
    for (let j = 0; j < stackTraceLines.length; j++) {
        let thisLine = stackTraceLines[j].trim();
        let matches = thisLine.match(/(\d+):(\d+)/);
        if (matches !== null) {
            let lineNumber = parseInt(matches[1]); // Retrieve the line number
            if (lineNumber >= userCodeLineNumberBegin && lineNumber <= userCodeLineNumberEnd) {
                let newLineNumber = lineNumber - userCodeLineNumberBegin - functionHeaderOffset + 1;
                let columnNumber = parseInt(matches[2]); // Retrieve the column number
                let newLine = `${newLineNumber}:${columnNumber}`; // Construct the new line with adjusted line number
                stackTraceLines[j] = thisLine.replace(matches[0], newLine); // Replace the entire matched portion with the new line
                if (errorLine === -1) {
                    errorLine = newLineNumber;
                }
            }
        }
    }

    //result.stack += "\nNew Stack:\n" + stackTraceLines.join('\n');
    result.stack = stackTraceLines.join('\n');
    return errorLine;
}

function safeToString(expectedResult: any) {
    if (expectedResult === undefined) {
        return "undefined";
    }
    if (expectedResult === null) {
        return "null";
    }
    return expectedResult.toString();
}

export function testUserCode(userData: UserData, problemData: ProblemData): TestResults {
    let userCode = userData.currentCode;

    // Check that we have balanced brackets
    {
        let brackets = 0;
        let lineNum = 1;
        let foundFirstBracket = false;
        let whitespaceRegex = /^\s*$/;
        let characterAfterLastBracket = {value: false, lineNum: -1};
        for (let i = 0; i < userCode.length; i++) {
            if (brackets === 0 && foundFirstBracket && !userCode[i].match(whitespaceRegex) && !characterAfterLastBracket.value) {
                characterAfterLastBracket = {value: true, lineNum: lineNum};
            }

            if (userCode[i] === '{') {
                if (foundFirstBracket && brackets === 0) {
                    return {
                        testResults: [],
                        expectedResults: getExpectedResults(problemData),
                        returnedResults: [],
                        parseError: "You began a new function after closing your first one. You cannot do that. If you want to define a new function, do it inside the first function.",
                        errorLine: lineNum,
                        runtimeError: "",
                        output: "",
                        ranSuccessfully: false
                    };
                }

                brackets++;
                foundFirstBracket = true;
            } else if (userCode[i] === '}') {
                brackets--;
            }

            if (userCode[i] === '\n') {
                lineNum++;
            }

            if (brackets < 0) {
                return {
                    testResults: [],
                    returnedResults: [],
                    expectedResults: getExpectedResults(problemData),
                    parseError: "Unbalanced brackets. Extra '}' found.",
                    errorLine: lineNum,
                    runtimeError: "",
                    output: "",
                    ranSuccessfully: false
                };
            }
        }

        if (brackets !== 0) {
            return {
                testResults: [],
                returnedResults: [],
                expectedResults: getExpectedResults(problemData),
                parseError: "Unbalanced brackets. Missing '}'.",
                errorLine: lineNum,
                runtimeError: "",
                output: "",
                ranSuccessfully: false
            };
        }

        if (!foundFirstBracket) {
            return {
                testResults: [],
                returnedResults: [],
                expectedResults: getExpectedResults(problemData),
                parseError: "No function found.",
                errorLine: lineNum,
                runtimeError: "",
                output: "",
                ranSuccessfully: false
            };
        }

        if (characterAfterLastBracket.value) {
            return {
                testResults: [],
                returnedResults: [],
                expectedResults: getExpectedResults(problemData),
                parseError: "You have stray character(s) after the last '}'.",
                errorLine: characterAfterLastBracket.lineNum,
                runtimeError: "",
                output: "",
                ranSuccessfully: false
            };
        }
    }

    // Check that the function signature is correct
    {
        let functionSignature = userCode.split('{')[0];
        let tokens = tokenizeFunctionSignature(functionSignature);

        let expectedFunctionSignature = problemData.solutionCode.split('{')[0];
        let expectedTokens = tokenizeFunctionSignature(expectedFunctionSignature);

        console.log(tokens);
        console.log(expectedTokens);

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].str !== expectedTokens[i].str) {

                let parseError = "Function signature does not match the expected signature. ";
                if (i === 0) {
                    parseError += "\nThe function signature should begin with `" + expectedTokens[i].str + "` but you have ";
                    if (tokens[i] === undefined || tokens[i].str === "") {
                        parseError += "nothing.";
                    } else {
                        parseError += "`" + tokens[i].str + "`.";
                    }
                } else {
                    if (tokens[i] === undefined || tokens[i].str === "") {
                        parseError += "Expected: `" + expectedTokens[i].str + "` but got nothing.";
                    } else {
                        parseError += "Expected: `" + expectedTokens[i].str + "` after `" + tokens.slice(0, i)
                            .map(t => t.str).join(" ") + "` but got: `" + tokens[i].str + "`.";
                    }
                }
                return {
                    testResults: [],
                    returnedResults: [],
                    expectedResults: getExpectedResults(problemData),
                    parseError,
                    errorLine: tokens[i].lineNum,
                    runtimeError: "",
                    output: "",
                    ranSuccessfully: false
                };
            }
        }

        if (tokens.length !== expectedTokens.length) {
            return {
                testResults: [],
                returnedResults: [],
                expectedResults: getExpectedResults(problemData),
                parseError: "Function signature does not match the expected signature. " +
                    "Expected: " + expectedFunctionSignature + " but got: " + functionSignature,
                errorLine: tokens[tokens.length - 1].lineNum,
                runtimeError: "",
                output: "",
                ranSuccessfully: false
            };
        }
    }

    // Parse the solution code and replace the function name with a random name
    let solutionCode = problemData.solutionCode;
    let resultsArrayName = "results" + crypto.randomUUID().replace(/-/g, '');
    let expectedResultsArrayName = "expectedResults" + crypto.randomUUID().replace(/-/g, '');

    let codeToRun = `
let ${resultsArrayName} = [] || [];
let ${expectedResultsArrayName} = [] || [];
    `;

    let userCodeLineNumberBegin = codeToRun.split('\n').length + 1;

    let userCodeLineNumberEnd = codeToRun.split('\n').length + 1;

    let combinedTests = problemData.tests.concat(problemData.hiddenTests);

    for (let i = 0; i < combinedTests.length; i++) {
        // Split out everything except the last line of the test case
        // The result is the output of the last line
        // We need to run that twice:
        //  - Once with the user's code
        //  - Once with the solution code
        // We'll then compare the results
        let testFull = combinedTests[i];
        let testSplitByLines = testFull.split('\n');
        let setupCode = testSplitByLines.slice(0, testSplitByLines.length - 1).join('\n');
        let getResult = testSplitByLines[testSplitByLines.length - 1];

        codeToRun += `
        {
            let expected;
            let result;
            {
                ${setupCode}
                {
${solutionCode}
                    try {
                        expected = ${getResult}
                    } catch (e) {
                        expected = e;
                    }
                }
                {
${userCode}
                    try {
                        result = ${getResult}
                    } catch (e) {
                        result = e;
                    }
                }
            }
            ${resultsArrayName}.push(result);
            ${expectedResultsArrayName}.push(expected);
        }
        `;
    }

    codeToRun += `
    return [${resultsArrayName}, ${expectedResultsArrayName}];
    `;

    // eslint-disable-next-line
    let resultsArray: any[] = [];
    // eslint-disable-next-line
    let expectedResultsArray: any[] = [];


    let testResults = new TestResults();

    try {
        let func = Function(codeToRun);
        let out = func();

        resultsArray = out[0];
        expectedResultsArray = out[1];
        testResults.ranSuccessfully = true;
    } catch (e) {
        testResults.ranSuccessfully = false;
        console.error("Failed to run the solution: " + e);
        testResults.expectedResults = getExpectedResults(problemData);
        if (e instanceof Error) {
            testResults.errorLine = reformatStackTrace(e, userCodeLineNumberBegin, userCodeLineNumberEnd);
            console.log(e.stack);
            testResults.runtimeError = e.stack as string;
        } else {
            testResults.runtimeError = e as string;
        }
    }

    for (let i = 0; i < combinedTests.length; i++) {

        if (i >= expectedResultsArray.length) {
            testResults.testResults.push(TestResult.NotRun);
            testResults.expectedResults.push("Unknown");
            testResults.returnedResults.push("Unknown");
            testResults.ranSuccessfully = false;
            continue;
        }

        if (i >= resultsArray.length) {
            testResults.testResults.push(TestResult.NotRun);
            testResults.expectedResults.push(expectedResultsArray[i].toString());
            testResults.returnedResults.push("Unknown");
            testResults.ranSuccessfully = false;
            continue;
        }

        let result = resultsArray[i];
        let expectedResult = expectedResultsArray[i];

        if (expectedResult instanceof Error) {
            testResults.expectedResults.push("Error");
            testResults.returnedResults.push("Error");
            testResults.testResults.push(TestResult.NotRun);
            console.error("A test case failed to run the solution: " + expectedResult);
            console.log("Test: " + combinedTests[i]);
            // TODO: Remove the bottom 2 lines
            console.log("Solution: " + problemData.solutionCode);
            console.log("User code: " + userCode);
            testResults.ranSuccessfully = false;
            continue;
        } else {
            testResults.expectedResults.push(safeToString(expectedResult));
        }

        if (result instanceof Error) {
            testResults.returnedResults.push("Error");
            testResults.testResults.push(TestResult.Exception);
            // End the stack trace at the user's code
            testResults.errorLine = reformatStackTrace(result, userCodeLineNumberBegin, userCodeLineNumberEnd);

            testResults.runtimeError = result.stack as string;
            testResults.ranSuccessfully = false;
            continue;
        } else {
            testResults.returnedResults.push(safeToString(result));
        }

        if (result !== expectedResult) {
            testResults.testResults.push(TestResult.Failed);
        } else {
            testResults.testResults.push(TestResult.Passed);
        }
    }

    return testResults;
}


export function getExpectedResults(problemData: ProblemData): string[] {
    // Parse the solution code and replace the function name with a random name
    let solutionCode = problemData.solutionCode;
    let expectedResultsArrayName = "expectedResults" + crypto.randomUUID().replace(/-/g, '');

    let codeToRun = `
let ${expectedResultsArrayName} = [] || [];
    
${solutionCode}
    `;

    let combinedTests = problemData.tests.concat(problemData.hiddenTests);

    for (let i = 0; i < combinedTests.length; i++) {
        // Split out everything except the last line of the test case
        // The result is the output of the last line
        // We need to run that twice:
        //  - Once with the user's code
        //  - Once with the solution code
        // We'll then compare the results
        let testFull = combinedTests[i];
        let testSplitByLines = testFull.split('\n');
        let setupCode = testSplitByLines.slice(0, testSplitByLines.length - 1).join('\n');
        let getResult = testSplitByLines[testSplitByLines.length - 1];

        codeToRun += `
        {
            let expected;
            let result;
            {
                ${setupCode}
                try {
                    expected = ${getResult}
                } catch (e) {
                    expected = e;
                }
            }
            ${expectedResultsArrayName}.push(expected);
        }
        `;
    }

    codeToRun += `
    return ${expectedResultsArrayName}
    `;
    // eslint-disable-next-line
    let expectedResultsArray: any[] = [];

    try {
        let func = Function(codeToRun);
        expectedResultsArray = func();
    } catch (e: any) {
        console.error("Failed to run the solution: " + e);
        console.log("Solution: " + problemData.solutionCode);
        return [];
    }

    return expectedResultsArray.map(result => safeToString(result));

}