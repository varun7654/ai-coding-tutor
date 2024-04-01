import {marked} from "./Problem";
import {Token, Tokens} from "marked";

export class ProblemData {
    id: string = "";
    title: string = 'Loading...';
    preProblemDescription: string = "";
    description: string = "";
    tests: TestCase[] = [];
    hiddenTests: TestCase[] = [];
    displayAbove: string = "";
    displayBelow: string = "";
    solution: string = "";
    solutionCode: string = "";
    codeLang: string = "";
    nextProblemId: string = "";
}

export class TestCase {
    test: string;
    display: string;
    magicLinks: Map<string, string>;

    constructor(test: string, display: string, magicLinks: Map<string, string>) {
        this.test = test;
        this.display = display;
        this.magicLinks = magicLinks;
    }
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
    let tests: TestCase[] = [];
    extractTestCases(tokens, tests);

    removeNextHeading(tokens, "Hidden Test Cases"); // Remove the hidden tests heading
    let hiddenTests: TestCase[] = [];
    extractTestCases(tokens, hiddenTests);

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
        hiddenTests,
        displayAbove,
        displayBelow,
        solution,
        solutionCode,
        codeLang,
        nextProblemId
    };
}

function extractTestCases(tokens: Token[], tests: TestCase[]) {
    // Tests are formatted as a list of functions in a code block with the expected result below it
    while (tokens.length > 0) {
        absorbWhitespace(tokens);
        if (tokens.length === 0 || tokens[0].type !== "code") break;
        let test = tokens.shift() as Tokens.Code;

        let testString = test.text.trim();
        let split = testString.split("\n").flatMap((s) => s.trim());
        let functionCall = split[split.length - 1];
        let indexBeginParen = functionCall.indexOf("(");
        let indexEndParen = -1;
        for (let i = functionCall.length - 1; i >= 0; i--) {
            if (functionCall[i] === ")") {
                indexEndParen = i;
                break;
            }
        }
        if (indexBeginParen === -1 || indexEndParen === -1) {
            console.error("Failed to parse function call (Magic Links will not work!): " + functionCall);
            continue;
        }
        let params = functionCall.substring(indexBeginParen + 1, indexEndParen).split(",").map(s => s.trim());

        absorbWhitespace(tokens);
        let repeatTimes = 1;
        let displayAs = testString;
        // Remove the last ; if it exists
        if (displayAs.endsWith(";")) {
            displayAs = displayAs.substring(0, displayAs.length - 1);
        }

        let magicLinks = new Map<string, string>();

        // @ts-ignore - ts seems to not believe that type could be paragraph
        while (tokens.length > 0 && tokens[0].type === "paragraph") {
            let metaData = (tokens.shift() as Tokens.Paragraph).text.trim();

            let split = metaData.split("=").map(s => s.trim());
            if (split.length !== 2) {
                console.error("Failed to parse metadata: " + metaData);
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

                let indexBeginParen = functionCall.indexOf("(");
                let indexEndParen = -1;
                for (let i = displayAs.length - 1; i >= 0; i--) {
                    if (displayAs[i] === ")") {
                        indexEndParen = i;
                        break;
                    }
                }
                if (indexBeginParen === -1 || indexEndParen === -1) {
                    console.error("Failed to parse function for displayAs meta call (Magic Links will not work!): " + displayAs);
                    continue;
                }
                params = displayAs.substring(indexBeginParen + 1, indexEndParen).split(",").map(s => s.trim());

            } else if (params.includes(split[0])) { // We don't want to remove the casing
                // This is a parameter
                magicLinks.set(split[0], value.trim());
            } else {
                console.error("Unknown metadata key: " + split[0]);
            }
            absorbWhitespace(tokens);
        }
        
        for (let i = 0; i < repeatTimes; i++) {
            tests.push({
                test: testString,
                display: displayAs,
                magicLinks
            });
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