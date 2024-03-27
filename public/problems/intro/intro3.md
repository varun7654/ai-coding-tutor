# Constant Functions 2

# Context

In algebra, it would be weird to define a function that has no input value. In programming, it's not so weird, and we do
it all the time.

We've been writing functions that take an input value and return a value based on that input like this:

```javascript
function f(x) {
    return x * x + 5;
}
```

But we can also write functions that don't take any input value at all, like this:

```javascript
function f() {
    return 2.71828;
}
```

Notice that there's no `x` in the parentheses after `f`. This means that `f` doesn't take any input value at all.

Also did you notice that the `return` value is a number with a decimal point?
Numbers can have decimal points in JavaScript, just like in math.
For us right now, you can write any real number you want in JavaScript, just like in math. (This isn't technically true,
but it's true enough for now.)

# Description

Let's write a function that returns a constant value, the first 7 digits of pi.

Notice that the function doesn't take any input value at all.

# Problem

```javascript
```

# Solution

```javascript
function f() {
    return 3.141592;
}
```

# Test Cases

# Hidden Test Cases

```javascript
f();
```

3.141592

# Next

/intro/intro4

# Tags




