# Fibonacci Problem

# Description

Write a function that takes in a number `n` and returns the `n`th number in the Fibonacci sequence.

The Fibonacci sequence is a series of numbers in which each number is the sum of the two preceding ones.

For reference, the 0th and 1st numbers in the Fibonacci sequence are `0` and `1`, respectively. 
The sequence starts like this: `0, 1, 1, 2, 3, 5, 8, 13, 21, 34` and so on.

# Problem
```javascript
function findNthFibonacci(n) {
  // Your code here
}
```

# Solution
There are many ways to solve this problem.

## Solution 1
```javascript
function findNthFibonacci(n) {
    if (n <= 1) return n;
    let a = 0, b = 1, c;
    for (let i = 2; i <= n; i++) {
        c = a + b;
        a = b;
        b = c;
    }
    return b;
}
```

This is an iterative solution to find the nth Fibonacci number. 
It works by using a loop to calculate the nth Fibonacci number by adding the previous two numbers in the sequence.


# Test Cases
```javascript
findNthFibonacci(0);
```
0
```javascript
findNthFibonacci(1);
```
1

```javascript
findNthFibonacci(2);
```

1
```javascript
findNthFibonacci(3);
```

2

```javascript
findNthFibonacci(4);
```

3

```javascript
findNthFibonacci(5);
```
5

```javascript
findNthFibonacci(6);
```
8

```javascript
findNthFibonacci(7);
```
13

```javascript
findNthFibonacci(8);
```
21

```javascript
findNthFibonacci(9);
```
34

```javascript
findNthFibonacci(10);
```
55

```javascript
findNthFibonacci(11);
```
89

# Hidden Test Cases
```javascript
let num = Math.floor(Math.random() * 1000);
findNthFibonacci(num);
```
repeat = 100

# Next
nothing

# Tags
- Recursion
- Fibonacci
- JavaScript



