# Piecewise Functions

# Context
In algebra, we can define a function made up of multiple functions also known as a piecewise function.

## Example 1

Take, for example, the function $ f(x) $ defined as:

$
f(x) =
\begin{cases}
    x + 1 & \text{if } x < 0 \\
    x - 1 & \text{if } x \geq 0 
\end{cases}
$

This function is defined as two separate functions, one for when $ x < 0 $ and one for when $ x \geq 0 $.

To do this in JavaScript, we need to use an `if` statement.

Let's first write out a JavaScript function that does the same thing as the algebraic function above.
After that, I'll explain how it works.

```javascript
function f(x) {
    if (x < 0) {
        return x + 1;
    } else {
        return x - 1;
    }
}
```
**Line 1**

We begin with the same function definition as before, `function f(x) {`. 
You'll notice how we now have more than the two braces (`{` and `}`) that we've seen so far.
The brace on the first line, `{`, and the brace on the last line, `}`, define the function body, just like before. 


**Line 2**

The second line, `if (x < 0) {`, has some syntax that we haven't seen before.
The `if` keyword tells the computer that we're going to check if something is true. 
The computer then looks for what's inside the parentheses, `(x < 0)`.
It then evaluates the expression inside the parentheses, `x < 0` and determines the truth of the statement (whether it's `true` or `false`).
If the statement is `true`, the computer executes the code inside the next pair of braces, `{` and `}`.

**Line 3**

The third line of code is inside the braces, `{` and `}`, that follow the `if` statement. 
This line of code is only run if the condition in the parentheses following the `if` statement is `true`.
In this case, if `x < 0` is `true`, the computer will run `return x + 1;`.

Note: The `return` and the code following it run exactly like we've seen before. 
The only difference is that the `return` is inside the `if` statement and _may not_ run if the condition is `false`.

**Line 4**

The fourth line contains the closing brace, `}`, that matches the opening brace, `{`, that follows the `if` statement. 

After the closing brace, `}`, we have the `else` keyword that is also new.
The `else` keyword tells the computer that if the condition in the `if` statement is `false`, then the computer should run the code inside the braces that follow the `else` keyword.
Think of the `else` keyword as saying "if the condition in the `if` statement is `false`, then do this other thing". 

The `else` keyword is followed by an opening brace, `{`, that contains the code that the computer should run if the condition in the `if` statement is `false`.

**Line 5**

Inside the braces that follow the `else` keyword, we have the line `return x - 1;` on the fifth line.
This line of code is only run if the condition in the `if` statement is `false`.
In this case, if `x < 0` is `false`, the computer will run `return x - 1;`.

**Line 6**

The sixth line contains the closing brace, `}`, that matches the opening brace, `{`, that follows the `else` keyword.

**Line 7**

The seventh line contains the closing brace, `}`, that matches the opening brace, `{`, that defines the function body.

### What does the indentation do?
You'll notice that after every opening brace, `{`, the following code is indented by 4 spaces and after every closing brace, `}`, the following code is unindented by 4 spaces.
In JavaScript, this indentation is not required, but it makes the code much easier to read. 
All braces come in pairs, and the indentation helps you see which braces match up with each other.
In the next problem, we'll be writing some code that'll showcase what exactly it means to have braces come in pairs and match up with each other.

For now though, try to get used to the indentation. It'll make your code much easier to read and understand.

## Example 2
Let's try another example. We'll go a little faster this time.

$
g(x) =
\begin{cases}
    x^2 & \text{if } x \geq -3 \\
    2x + 1 & \text{if } -10 < x < -3 \\
    x + 1 & \text{if } x \leq -10
\end{cases}
$

This function will be defined in JavaScript as:

```javascript
function g(x) {
    if (x >= -3) {
        return x ** 2;
    } else if (-10 < x && x < -3) {
        return 2 * x + 1;
    } else {
        return x + 1;
    }
}
```

**Line 2-3**

The `if` statement checks if `x >= -3` is `true`. If it is, the computer runs the code inside the braces that follow the `if` statement.

So, if `x >= -3` is `true`, the computer will run `return x ** 2;`.

Notice that we use `>=` to denote "greater than or equal to" in JavaScript. The same is true for `<=` which denotes "less than or equal to".

**Line 4–5**

We have another thing we haven't seen before, the `else if` statement. 
The `else if` statement is used when we have more than one condition to check.

Like the `else` statement, the `else if` statement only runs if the condition in the `if` statements that proceed it are `false`.
Additionally, like the `if` statement, the `else if` statement checks if the condition inside the parentheses is `true` 
before running the code inside the braces that follow it.

So, if `-10 < x && x < -3` is `true`, the computer will run `return 2 * x + 1;`.

Notice that the `&&` is used to denote an "and" in JavaScript. We must use two `&` symbols to denote an "and" in JavaScript. 
The single `&` symbol is used for something else, and we'll learn about it later.

Also note: `-10 < x < -3` isn't valid JavaScript syntax. While in algebra we could write this, in JavaScript we can only perform one comparison at a time.
(We need to split the comparison into two separate comparisons, `-10 < x && x < -3`.)

**Line 6–8**

The `else` statement is used to catch any values of `x` that don't satisfy the conditions in the `if` and `else if` statements.
If there were more `else if` statements, the `else` statement would only run if all the conditions in the `if` and `else if` statements were `false`.

So, if `x >= -3` is `false` and `-10 < x && x < -3` is `false`, the computer will run `return x + 1;`.

# Description
## Let's try this
Write a function that is equivalent to the following piecewise function:

$
f(x) =
\begin{cases}
    6x + 3 & \text{if } x > 4 \\
    x^2 - 1 & \text{if } 0 \leq x \leq 4 \\
    2x + 1 & \text{if } -2 \leq x < 0 \\
    -x & \text{if } x < -2
\end{cases}
$

## Reference:
- `<=` denotes "less than or equal to" in JavaScript.
- `>=` denotes "greater than or equal to" in JavaScript.
- `&&` denotes "and" in JavaScript.
- `**` denotes an exponent in JavaScript.


# Problem
```javascript
function f(x) {
    // Your code here
}
```

# Solution
```javascript
function f(x) {
    if (x > 4) {
        return 6 * x + 3;
    } else if (x <= 4 && x >= 0) {
        return x ** 2 - 1;
    } else if (-2 <= x && x < 0) {
        return 2 * x + 1;
    } else {
        return -x;
    }
}
```

# Test Cases
```javascript
f(5);
```
33
```javascript
f(4);
```
27
```javascript
f(3);
```
8
```javascript
f(0);
```
-1
```javascript

f(-1);
```
-1
```javascript
f(-2);
```
-3
```javascript
f(-3);
```
3
```javascript
f(-4);
```
4


# Hidden Test Cases
```javascript
let random = Math.floor(Math.random() * 20) - 10;
f(random);
```
repeat=25

```javascript
let random = Math.floor(Math.random() * 100) - 50;
f(random);
```
repeat=25

# Next


# Tags




