import {marked} from "./Problem";
import {Token, Tokens} from "marked";

export class ProblemData {
    id: string = "";
    title: string = 'Loading...';
    preProblemDescription: string = "";
    description: string = "";
    tests: string[] = [];
    testsDisplay: string[] = [];
    hiddenTests: string[] = []
    hiddenTestsDisplay: string[] = [];
    displayAbove: string = "";
    displayBelow: string = "";
    solution: string = "";
    solutionCode: string = "";
    codeLang: string = "";
    nextProblemId: string = "";
}

export function parseProblem(text: string, id: string): ProblemData {
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
    removeNextHeading(tokens, "description"); // Remove the description heading

    let description = "";
    while (tokens.length > 0 && (tokens[0].type !== "heading" || (tokens[0] as Tokens.Heading).depth > 1)) {
        description += ((tokens.shift() as Token).raw);
    }

    removeNextHeading(tokens, "Problem"); // Remove the problem heading
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


    removeNextHeading(tokens, "Solution"); // Remove the solution heading
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

    removeNextHeading(tokens, "Test Cases"); // Remove the tests heading
    let tests: string[] = [];
    let testsDisplay: string[] = [];
    extractTestCases(tokens, tests, testsDisplay);

    removeNextHeading(tokens, "Hidden Test Cases"); // Remove the hidden tests heading
    let hiddenTests: string[] = [];
    let hiddenTestsDisplay: string[] = [];
    extractTestCases(tokens, hiddenTests, hiddenTestsDisplay);

    removeNextHeading(tokens, "Next");
    let nextProblemId;
    if (tokens.length === 0 || tokens[0].type !== "paragraph") {
        nextProblemId = "nothing";
    } else {
        nextProblemId = (tokens.shift() as Tokens.Paragraph).text;
        nextProblemId = nextProblemId.trim();
        if (nextProblemId.startsWith("/")) {
            nextProblemId = nextProblemId.substring(1);
        }
        if (nextProblemId.endsWith("/")) {
            nextProblemId = nextProblemId.substring(0, nextProblemId.length - 1);
        }
        if (nextProblemId === "") {
            nextProblemId = "nothing";
        }
    }


    return {
        id,
        title,
        preProblemDescription,
        description,
        tests,
        testsDisplay,
        hiddenTests,
        hiddenTestsDisplay,
        displayAbove,
        displayBelow,
        solution,
        solutionCode,
        codeLang,
        nextProblemId
    };
}

function extractTestCases(tokens: Token[], tests: string[], testsDisplay: string[]) {
    // Tests are formatted as a list of functions in a code block with the expected result below it
    while (tokens.length > 0) {
        absorbWhitespace(tokens);
        if (tokens.length === 0 || tokens[0].type !== "code") break;
        let test = tokens.shift() as Tokens.Code;

        absorbWhitespace(tokens);
        let repeatTimes = 1;
        let displayAs = "";

        // @ts-ignore - ts seems to not believe that type could be paragraph
        if (tokens.length === 0 || tokens[0].type === "paragraph") {
            let str = (tokens.shift() as Tokens.Paragraph).text.trim();
            let metaData = str.split("\n").map(s => s.trim());

            for (let str of metaData) {
                let split = str.split("=").map(s => s.trim());
                if (split.length !== 2) {
                    console.error("Failed to parse metadata: " + str);
                    continue;
                }
                let key = split[0].toLowerCase();
                let value = split[1];

                if (key === "repeat") {
                    let num = parseInt(value);
                    if (isNaN(num)) {
                        console.error("Failed to parse repeat value: " + value);
                    } else {
                        repeatTimes = num;
                    }
                } else if (key === "displayas") {
                    displayAs = value;
                }

            }
        }
        if (displayAs === "") {
            displayAs = test.text.trim();
            // Remove the last ; if it exists
            if (displayAs.endsWith(";")) {
                displayAs = displayAs.substring(0, displayAs.length - 1);
            }
        }
        for (let i = 0; i < repeatTimes; i++) {
            tests.push(test.text);
            testsDisplay.push(displayAs);
        }
    }
}


export function removeNextHeading(tokens: Token[], expectedText: string) {
    removeTillNextType(tokens, "heading");
    if (tokens.length === 0) {
        new Error("Problem Parse: Expected a heading with text: " + expectedText);
        return;
    } else {
        let heading = tokens.shift() as Tokens.Heading;
        if (heading.text.trim().toLowerCase() === expectedText.trim().toLowerCase()) {
            new Error("Problem Parse: Expected a heading with text: " + expectedText + " but got: " + heading.text);
        }
    }
}

export function removeTillNextType(tokens: Token[], type: string) {
    while (tokens.length > 0 && tokens[0].type !== type) {
        tokens.shift();
    }
}

export function removeNextType(tokens: Token[], type: string) {
    while (tokens.length > 0 && tokens[0].type !== type) {
        tokens.shift();
    }
    tokens.shift();
}

export function absorbWhitespace(tokens: Token[]) {
    while (tokens.length > 0 && tokens[0].type === "space") {
        tokens.shift();
    }
}