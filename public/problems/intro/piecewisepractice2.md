# Piecewise Function Practice 2

# Description

Write a function that is equivalent to the following piecewise function:

$
f(x) =
\begin{cases}
17x/4 + 2 & \text{if } x \geq -4 \\
x^4 - 3 & \text{if } -6.5 < x < -4 \\
x^2 + 1 & \text{if } -8 \leq x \leq -6.5 \\
x/2 + 1 & \text{if } x < -8
\end{cases}
$

# Problem

```javascript
function f(x) {
    // Your code here
}
```

# Solution

```javascript
function f(x) {
    if (x >= -4) {
        return 17 * x / 4 + 2;
    } else if (-6.5 < x && x < -4) {
        return x ** 4 - 3;
    } else if (-8 <= x && x <= -6.5) {
        return x ** 2 + 1;
    } else {
        return x / 2 + 1;
    }
}
```

# Test Cases

```javascript
f(-3);
```

```javascript
f(-4);
```

```javascript
f(-5);
```

```javascript
f(-6.5);
```

```javascript
f(-7);
```

```javascript
f(-8);
```

```javascript
f(-9);
```

# Hidden Test Cases

```javascript
let random = Math.floor(Math.random() * 20) - 13;
f(random);
```

repeat = 100

```javascript
let random = Math.floor(Math.random() * 1000) - 50;
f(random);
```

repeat = 100

# Next

intro/piecewisepractice3

# Tags

Piecewise Function, Conditional Statements