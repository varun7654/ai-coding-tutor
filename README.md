# WeCode

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm deploy`

Deploys the app to GitHub Pages.

# Problem Format

Each problem is a markdown file in the `public/problems` directory.

## Problem Structure

### Title (required)

The title of the problem is the first heading in the markdown file.

### Context (optional)

The context of the problem for the user. The AI assistant is not given this section, and it is only for the user.
Use this to provide information is not about the problem.

For example, use this information to teach a short concept that is required to solve the problem.

The text in this section will show up with the description (under the description heading) in the problem page.
(There will be no headers placed in between the context and description)

### Description (required)

The description of the problem. This is where the problem is described to the user.
This information is given to the AI assistant.

### Problem (required)

The template code for the problem. This is where the user will write their solution.

It should be a code block and a language must be specified.

If this is not empty, one line must have a comment that looks like: `// Your code here`
where you intend the user to write their solution. This is used for parsing the user's code and checking syntax errors.

It could look something like this:

```
\`\`\`javascript
function f(x) {
    // Your code here
}
\`\`\`
```

### Solution (required)

The solution to the problem in the form of a code block.

It must match the language specified in the problem section.

The solution is given to the AI assistant to help it provide hints to the user, but the user does not see this section.

It is additionally used to determine the correct answers to the test cases.

### Test Cases (required)

If you don't want to provide any visible test cases, you can leave this section empty, but it must be present.

The test cases are given to the user to test their solution.

The test cases should be in the form of code blocks and should be in the same language as the problem.
In the code block, you should call the function with the test case and log the result.

For example:

```
\`\`\`javascript
f(0);
\`\`\`
```

Test cases can also be longer than one line. This allows you to write extra code to set up parameters for the function
call.

The last line of the code block must call the function that you're testing.
The result of the function is captured and is used to determine if the user's solution is correct. (We do a string
comparison of the result).

Note the setup code is shared between the user's code and the test cases.
It is only run once for both method calls. Ensure that it is immutable.

We do run the solution code before the user's code to ensure the user's code isn't tampering with any state.

#### Modifiers

Modifiers should be placed after the test case code block that you want them to apply to.

If you want to add modifiers to the test cases, you should separate them with commas.

- repeat=\<number\>: This modifier will repeat the test case the specified number of times.
  This is useful for testing functions where you're randomly generating input values.
  For example:
    ```
    \`\`\`javascript
    let random = Math.floor(Math.random() * 1000);
    f(random);
    \`\`\`
    ```
  repeat=100
- displayas=\<string\>: This modifier will display the test case as the specified string.
  This is useful for hiding the actual test case from the user when there is complex setup code.

### Hidden Test Cases

These test cases are the same as the visible test cases, but they are not shown to the user.

They are used to verify the correctness of the user's solution.

### Next (required)

The problemId of the next problem the user should work on.

Leave blank or write "nothing" if there is no next problem.

### Tags (optional)

Tags that describe the problem. Currently unused.