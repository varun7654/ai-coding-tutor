import {ProblemData, UserData} from "./Problem";

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
                        expectedResults: [],
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
                    expectedResults: [],
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
                expectedResults: [],
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
                expectedResults: [],
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
                    expectedResults: [],
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
                expectedResults: [],
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

    let userCodeLineNumberBegin = codeToRun.split('\n').length;

    codeToRun += `
    ${userCode}
    `;

    let userCodeLineNumberEnd = codeToRun.split('\n').length;

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
                console.log("${i} " + result);
                try {
                    expected = ${getExpectedResult}
                    console.log("${i} expected: " + expected);
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
    console.log(${resultsArrayName});
    console.log(${expectedResultsArrayName});
    return [${resultsArrayName}, ${expectedResultsArrayName}];
    `;

    console.log(codeToRun);
    // eslint-disable-next-line
    let resultsArray: any[] = [];
    // eslint-disable-next-line
    let expectedResultsArray: any[] = [];


    let testResults = new TestResults();

    try {
        let out = Function(codeToRun)();
        console.log(out);

        resultsArray = out[0];
        expectedResultsArray = out[1];
        testResults.ranSuccessfully = true;
    } catch (e: any) {
        testResults.ranSuccessfully = false;
        testResults.runtimeError = e;
    }

    for (let i = 0; i < combinedTests.length; i++) {
        if (expectedResultsArray[i] === undefined) {
            testResults.testResults.push(null);
            testResults.expectedResults.push("Unknown");
            testResults.ranSuccessfully = false;
            continue;
        }
        if (resultsArray[i] === undefined) {
            testResults.testResults.push(null);
            testResults.expectedResults.push(expectedResultsArray[i].toString());
            testResults.ranSuccessfully = false;
            continue;
        }

        let result = resultsArray[i];
        let expectedResult = expectedResultsArray[i];

        if (expectedResult instanceof Error) {
            testResults.testResults.push(true);
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
            testResults.testResults.push(false);
            testResults.runtimeError = result;
            testResults.ranSuccessfully = false;
            continue;
        }

        if (result !== expectedResult) {
            testResults.testResults.push(false);
        } else {
            testResults.testResults.push(true);
        }
    }


    return testResults;
}


export class TestResults {
    public testResults: (boolean | null)[]  = [];
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