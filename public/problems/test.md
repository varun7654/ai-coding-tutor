# Test Problem

## Description

This is the description of the problem.
- All the markdown is supported.
- You can use lists, images, etc.
- You can also use code blocks:
    ```javascript
    function hello() {
      console.log('Hello, World!');
    }
    ```

# Problem
```javascript
function findNthFibonacci(n) {
  // Your code here
}
```

# Solution
```javascript
function findNthFibonacci(n) {
  if (n <= 1) return n;
  return findNthFibonacci(n - 1) + findNthFibonacci(n - 2);
}
```
This is a simple recursive solution to find the nth Fibonacci number. 
It has a time complexity of O(2^n) and a space complexity of O(n).

It works by breaking down the problem into smaller subproblems and solving them recursively.

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
findNthFibonacci(12);
```
144
```javascript
findNthFibonacci(13);
```
233
```javascript
findNthFibonacci(14);
```
377
```javascript
findNthFibonacci(15);
```
610
```javascript
findNthFibonacci(16);
```
987
```javascript
findNthFibonacci(17);
```
1597
```javascript
findNthFibonacci(18);
```
2584

# Tags
- Recursion
- Fibonacci
- JavaScript



