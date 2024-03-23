# More on Functions 3

# Context
Like in math, we can create a function that takes multiple input values and returns a single value.

For example, the function $ f(x, y) = x + y $.
Looks like this in JavaScript:
```javascript
function f(x, y) {
  return x + y;
}
```

Here, we've defined a function called `f` that takes two input values `x` and `y` and returns `x + y`.
Notice that the input values are separated by a comma in the parentheses after `f`. These are required and not putting them there will cause an error.

Nothing is preventing us from writing a function that takes 3, 4, 5, or even more input values.

Here we have a function that takes 3 input values and returns the sum of the squares of the input values:
```javascript
function f(x, y, z) {
  return x * x + y * y + z * z;
}
```

One other thing to note is that javascript obeys the order of operations just like you're used to in math.
That's why we can write `x * x + y * y + z * z` and not have to worry about the computer doing the wrong thing.

Just like in math, we can use parentheses to make the function clearer.

```javascript
function f(x, y, z) {
  return (x * x) + (y * y) + (z * z);
}
```
This is the same as the function above, but it's a little more clear what we want the computer to do.

Some functions that we want to write will require parentheses to make sure the computer does exactly what we want it to do.

For example, if we have:

$ f(a, b, c, d) = a^2 + 2 * (a + b) + c $

We would write the function in JavaScript like this:
```javascript
function f(a, b, c) {
  return a ** 2 + 2 * (a + b) + c;
}
```
With parentheses in the exact same places as in the algebraic function.

Also note that we use "**" to denote an exponent in JavaScript.
The "^" symbol is used for something else, and we'll learn about it later.


# Description
## Let's try this
Let's write a function that takes 4 inputs and calculates the following:

$ f(a, b, c, d) = (3 * (a + b) ^ 2 + c) * d $

### Note:
Remember, in JavaScript, we use `**` to denote an exponent.

# Problem
```javascript
```

# Solution
```javascript
function f(a, b, c, d) {
    return (3 * (a + b) ** 2 + c) * d;
}
```

# Test Cases
```javascript
f(1, 2, 3, 4);
```
120
```javascript
f(0, 0, 0, 0);
```
0
```javascript
f(1, 1, 1, 1);
```
13
```javascript
f(2, 2, 2, 2);
```
100
```javascript
f(0, 0.75, 1.5, 5);
```
15.9375

# Hidden Test Cases
```javascript
f(0, 1, 2, 4);
```
20

```javascript
f(-1, 2, 100, 4);
```
412

```javascript
f(7, -32, 56, 8);
```
15448

```javascript
f(0, 1, 0, 0);
```
0

```javascript
f(0, 0, 0, 1);
```
0

```javascript
f(1003, 123, -1256, 0);
```
0

```javascript
f(-28,4,12,-4);
```
−6960

# Hidden Test Cases

# Next
/intro/intro5

# Tags




