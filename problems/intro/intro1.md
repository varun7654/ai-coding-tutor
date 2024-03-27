# Learning to Code

# Context

Thought this course, we will be using JavaScript as our programming language.

You'll learn though a series of bite-sized programming challenges that will help you learn the basics of programming.
The challenges are designed to be fun and engaging, and to help you learn how to think like a programmer.
We'll start with the basics and gradually build up to more complex problems.

While we'll be using JavaScript, the concepts you'll learn are applicable to any programming language.
We'll avoid going too deep into the language-specific details, and instead focus on the core concepts that are common to
all programming languages.

## Prerequisites

- No prior programming experience is required.
- Knowledge of algebra will be extremely helpful.
    - A lot of our problems will build on the concepts of algebra, so having a good understanding of algebra will be
      very helpful.
    - You don't need to be an expert, but you should be comfortable with basic algebraic concepts like variables,
      functions, function notation, and function composition.

## What you'll learn

- How to write javascript code.
- How to solve problems using code.
- How to think like a programmer.
- How to break down complex problems into smaller, more manageable parts.
- How to use code to solve real-world problems.
- How to use code to automate repetitive tasks.

## How to use this course

- Each problem will be presented as a challenge that you need to solve.
- You'll be given a problem statement, and you'll need to write a function that solves the problem.
- You'll be given a set of test cases that your function should pass.
    - Some of the test cases will be visible to you, while others will be hidden to prevent you from basing your
      solution on the visible test cases. You should write your function so that it passes all the test cases.
    - You have unlimited attempts to solve each problem`.
- Feel free to skip around and work on the problems in any order you like.
- If you get stuck, press the "I'm stuck" button, and an AI-powered tutor will analyze your code and give you a hint to
  help get you unstuck!

## Let's get started!

You're probably familiar with functions from algebra.
In algebra, a function is a rule that assigns each input value to exactly one output value.

Take, for example:

$ f(x) = x + 1 $.

In this function, the input value is x, and the output value is x squared.

Let's try to write a function in JavaScript that does the same thing.

```javascript
function f(x) {
    return x + 1;
}
```

Notice that the function is defined using the `function` keyword.
In javascript, the `function` keyword tells the computer that the following code is a function.

The text between the `function` keyword and the parentheses is the name of the function.
In this case, the function is called `f`.

The parentheses that are immediately after the function name are where we put the input value to the function.
You can think of the parentheses and variable, `x` inside them exactly like the variable and parentheses in the
algebraic function.

The `{` and `}` are used to define the body of the function.
You don't see these in math, but they tell JavaScript where the function starts and ends.
So, the function begins after the `{` and ends after the `}`.

The `return` keyword tells the computer what the output value of the function is.
When the computer sees the `return` keyword, it reads whatever code is after it and "returns" that value as the output
of the function.

So, with the code above, we've defined a function called `f` that takes an input value `x` and returns `x + 1`.

If we wanted to use this function, we could call it like this:

```javascript
f(3);
```

This should look eerily similar to the algebraic function notation you're used to and for now, that's exactly what it
is.

This function does exactly what you'd expect. It takes the input value `3` and returns `3 + 1`, which is `4`.

### Some more examples of functions

```javascript
function g(x) {
    return x * 2;
}
```

Here, we've defined a function called `g` that takes an input value `x` and returns `x * 2`.

So, if we called `g(3)`, it would return `3 * 2`, which is `6`.

```javascript
function h(a) {
    return a * a;
}
```

Here, we've defined a function called `h` that takes an input value `a` and returns `a * a`. (or `a` squared)

So, if we called `h(3)`, it would return `3 * 3`, which is `9`.

# Description

## Your first challenge

Can you write the function for the following algebraic function?

$ f(x) = x + 5 $

# Problem

```javascript
```

# Solution

```javascript
function f(x) {
    return x + 5;
}
```

# Test Cases

```javascript
f(1)
```

6

```javascript
f(2)
```

7

```javascript
f(3)
```

8

```javascript
f(4)
```

9

```javascript
f(-1)
```

4

```javascript
f(-2)
```

3

```javascript
f(-3)
```

2

# Hidden Test Cases

```javascript
f(5)
```

10

```javascript
f(6)
```

11

```javascript
f(7)
```

12

```javascript
f(8)
```

13

```javascript
f(9)
```

14

```javascript
f(10)
```

15

```javascript
f(11)
```

16

```javascript
f(12)
```

17

```javascript
f(13)
```

18

```javascript
f(14)
```

19

```javascript
f(15)
```

20

```javascript
f(16)
```

21

```javascript
f(-4)
```

1

```javascript
f(-5)
```

0

```javascript
f(-6)
```

-1

```javascript
f(-7)
```

-2

```javascript
f(-8)
```

# Next

/intro/intro2

# Tags