# Piecewise Function Practice 1

# Description

Write a function that is equivalent to the following piecewise function:

$
f(x) =
\begin{cases}
-3x + 3 & \text{if } x >= 8 \\
x^{3/2} - 1 & \text{if } 2 < x < 8 \\
x/4 + 1 & \text{if } 0 <= x <= 2 \\
x^4/4 - 3x^2 + 2x + 1 & \text{if } x < 0
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
    if (x >= 8) {
        return -3 * x + 3;
    } else if (2 < x && x < 8) {
        return x ** (3 / 2) - 1;
    } else if (0 <= x && x <= 2) {
        return x / 4 + 1;
    } else {
        return x ** 4 / 4 - 3 * x ** 2 + 2 * x + 1;
    }
}
```

# Test Cases

```javascript
f(8); 
```

```javascript
f(7); 
```

```javascript
f(6); 
```

```javascript
f(5); 
```

```javascript
f(4); 
```

```javascript
f(3); 
```

```javascript
f(2); 
```

```javascript
f(1); 
```

```javascript
f(0); 
```

```javascript
f(-1); 
```

```javascript
f(-2); 
```

# Hidden Test Cases

```javascript
let random = Math.floor(Math.random() * 20) - 7;
f(random);
```

repeat = 100

```javascript
let random = Math.floor(Math.random() * 1000) - 50;
f(random);
```

repeat = 100

# Next

intro/piecewisepractice2

# Tags

Piecewise Function, Conditional Statements