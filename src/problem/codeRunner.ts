import {ProblemData, UserData} from "./Problem";

const functionHeaderOffset = 2;

export enum TestResult {
    Passed = "Passed",
    Failed = "Failed",
    Exception = "Exception",
    NotRun = "Not run"
}

export class TestResults {
    public testResults: TestResult[]  = [];
    public expectedResults: string[] = [];
    public parseError: string = "";
    public errorLine: number = -1;
    public runtimeError: any = null;
    public output: string = "";
    public ranSuccessfully: boolean = false;
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
function tokenizeFunctionSignature(signature: string) : StringLineNum[] {
    let tokens: StringLineNum[] = [];
    let lineNum = 1;

    const tokenChars = [' ', '(', ')', '{', '}', ':', ',', ';', '\n'];


    let bufferStartIndex = 0;
    for (let i = 0; i < signature.length; i++) {
        if (tokenChars.includes(signature[i])) {
            if (bufferStartIndex !== i) {
                tokens.push(new StringLineNum(signature.substring(bufferStartIndex, i), lineNum));
                bufferStartIndex = i + 1;
            }

            if (signature[i] === '\n') {
                lineNum++;
            }
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
}

export function testUserCode(userData: UserData, problemData: ProblemData) : TestResults {
    let userCode = userData.currentCode;

    // Check that we have balanced brackets
    {
        let brackets = 0;
        let lineNum = 1;
        let foundFirstBracket = false;
        for (let i = 0; i < userCode.length; i++) {
            if (userCode[i] === '{') {
                if (foundFirstBracket && brackets === 0){
                    return {
                        testResults: [],
                        expectedResults: getExpectedResults(problemData),
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
                expectedResults: getExpectedResults(problemData),
                parseError: "No function found.",
                errorLine: lineNum,
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

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].str !== expectedTokens[i].str) {
                return {
                    testResults: [],
                    expectedResults: getExpectedResults(problemData),
                    parseError: "Function signature does not match the expected signature. " +
                        "Expected: " + expectedFunctionSignature + " but got: " + functionSignature,
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
    let functionName = tokenizeFunctionSignature(solutionCode.split('{')[0])[1].str;
    let randomFunctionName = "function" + crypto.randomUUID().replace(/-/g, '');
    solutionCode = solutionCode.replace(functionName, randomFunctionName);
    let resultsArrayName = "results" + crypto.randomUUID().replace(/-/g, '');
    let expectedResultsArrayName = "expectedResults" + crypto.randomUUID().replace(/-/g, '');

    let codeToRun = `
let ${resultsArrayName} = [] || [];
let ${expectedResultsArrayName} = [] || [];
    
${solutionCode}
    `;

    let userCodeLineNumberBegin = codeToRun.split('\n').length + 1;

    codeToRun += `
${userCode}
    `;

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
        let getExpectedResult = getResult.replace(functionName, randomFunctionName);

        codeToRun += `
        {
            let expected;
            let result;
            {
                ${setupCode}
                try {
                    result = ${getResult}
                } catch (e) {
                    result = e;
                }
                try {
                    expected = ${getExpectedResult}
                } catch (e) {
                    expected = e;
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
    } catch (e: any) {
        testResults.ranSuccessfully = false;
        reformatStackTrace(e, userCodeLineNumberBegin, userCodeLineNumberEnd);
        testResults.runtimeError = e;
    }

    for (let i = 0; i < combinedTests.length; i++) {
        if (expectedResultsArray[i] === undefined) {
            testResults.testResults.push(TestResult.NotRun);
            testResults.expectedResults.push("Unknown");
            testResults.ranSuccessfully = false;
            continue;
        }
        if (resultsArray[i] === undefined) {
            testResults.testResults.push(TestResult.NotRun);
            testResults.expectedResults.push(expectedResultsArray[i].toString());
            testResults.ranSuccessfully = false;
            continue;
        }

        let result = resultsArray[i];
        let expectedResult = expectedResultsArray[i];

        if (expectedResult instanceof Error) {
            testResults.testResults.push(TestResult.NotRun);
            console.error("A test case failed to run the solution: " + expectedResult);
            console.log("Test: " + combinedTests[i]);
            // TODO: Remove the bottom 2 lines
            console.log("Solution: " + problemData.solutionCode);
            console.log("User code: " + userCode);
            testResults.ranSuccessfully = false;
            continue;
        } else {
            testResults.expectedResults.push(expectedResult.toString());
        }

        if (result instanceof Error) {
            testResults.testResults.push(TestResult.Exception);
            // End the stack trace at the user's code
            reformatStackTrace(result, userCodeLineNumberBegin, userCodeLineNumberEnd);

            testResults.runtimeError = result;
            testResults.ranSuccessfully = false;
            continue;
        }

        if (result !== expectedResult) {
            testResults.testResults.push(TestResult.Failed);
        } else {
            testResults.testResults.push(TestResult.Passed);
        }
    }


    return testResults;
}


export function getExpectedResults(problemData: ProblemData) : string[] {
    // Parse the solution code and replace the function name with a random name
    let solutionCode = problemData.solutionCode;
    let functionName = tokenizeFunctionSignature(solutionCode.split('{')[0])[1].str;
    let randomFunctionName = "function" + crypto.randomUUID().replace(/-/g, '');
    solutionCode = solutionCode.replace(functionName, randomFunctionName);
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
        let getExpectedResult = getResult.replace(functionName, randomFunctionName);

        codeToRun += `
        {
            let expected;
            let result;
            {
                ${setupCode}
                try {
                    expected = ${getExpectedResult}
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

    return expectedResultsArray.map(result => result.toString());

}