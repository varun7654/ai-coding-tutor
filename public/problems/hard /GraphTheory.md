# Travelling Salesman Problem

## Context
The Travelling Salesman Problem (TSP) is a classic algorithmic problem in the field of computer science and operations research. It focuses on optimization. In this problem, a salesman is given a list of cities, and must determine the shortest possible route that allows him to visit each city once and return to his original location.

## Example
Consider a set of cities: `{A, B, C, D}`. The distances between each pair of cities are given in a matrix form:

    ```
        A   B   C   D
    A   0   10  15  20
The shortest possible route that visits each city once and returns to the original city is `A -> B -> D -> C -> A` with a total distance of `80`.

## Description
Write a function that takes a matrix of distances between cities and returns the shortest possible route that a salesman can take to visit each city once and return to the original city.

## Problem
```javascript
function travellingSalesmanProblem(distances) {
    // Your code here
}
```
console.log(travellingSalesmanProblem([
[0, 10, 15, 20],
[10, 0, 35, 25],
[15, 35, 0, 30],
[20, 25, 30, 0]
])); // ["A", "B", "D", "C", "A"]