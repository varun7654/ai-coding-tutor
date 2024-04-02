# Graph Theory

## Context

The Travelling Salesman Problem (TSP) is a classic algorithmic problem in the field of computer science and operations
research. It focuses on optimization. In this problem, a salesman is given a list of cities, and must determine the
shortest possible route that allows him to visit each city once and return to his original location.

* The number of cities is between 2 and 10.
* The distance between any two cities is between 1 and 100.

## Example

Consider a set of cities: `{A, B, C, D}`. The distances between each pair of cities are given in a matrix form:

```text
        A   B   C   D
    A   0   10  15  20
```

The shortest possible route that visits each city once and returns to the original city is `A -> B -> D -> C -> A` with
a total distance of `80`.

# Description

Write a function that takes a matrix of distances between cities and returns the shortest possible route that a salesman
can take to visit each city once and return to the original city.

# Problem

```javascript
function travellingSalesmanProblem(distances) {
    // Your code here
}
```

## Solution

```javascript
function travellingSalesmanProblem(distances) {
    const n = distances.length;
    const VISITED_ALL = (1 << n) - 1;
    const dp = Array.from({length: n}, () => Array(1 << n).fill(-1));

    function tsp(mask, pos) {
        if (mask === VISITED_ALL) {
            return distances[pos][0];
        }
        if (dp[pos][mask] !== -1) {
            return dp[pos][mask];
        }

        let ans = Infinity;

        for (let city = 0; city < n; city++) {
            if ((mask & (1 << city)) === 0) {
                let newAns = distances[pos][city] + tsp(mask | (1 << city), city);
                ans = Math.min(ans, newAns);
            }
        }

        return dp[pos][mask] = ans;
    }

    return tsp(1, 0);
}
```

# Test Cases

```javascript
// Test case 1
let distances1 = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0]
];
travellingSalesmanProblem(distances1); // Expected output: 80
```

displayas = travellingSalesmanProblem(distances1);

distances1 =

```javascript
[
    //A   B   C   D
    [0, 10, 15, 20], // A
    [10, 0, 35, 25], // B
    [15, 35, 0, 30], // C
    [20, 25, 30, 0]  // D
];
```

```javascript
// Test case 2
let distances2 = [
    [0, 5, 11, 9],
    [5, 0, 7, 6],
    [11, 7, 0, 10],
    [9, 6, 10, 0]
];
travellingSalesmanProblem(distances2); // Expected output: 27
```

displayas = travellingSalesmanProblem(distances2);

distances2 =

```javascript
[
    //A   B   C   D
    [0, 5, 11, 9], // A
    [5, 0, 7, 6], // B
    [11, 7, 0, 10], // C
    [9, 6, 10, 0]  // D
];
```

```javascript
// Test case 3
let distances3 = [
    [0, 1, 15, 6],
    [2, 0, 7, 3],
    [9, 6, 0, 12],
    [10, 4, 8, 0]
];
travellingSalesmanProblem(distances3); // Expected output: 21
```

displayas = travellingSalesmanProblem(distances3);

distances3 =

```javascript
[
    //A   B   C   D
    [0, 1, 15, 6], // A
    [2, 0, 7, 3], // B
    [9, 6, 0, 12], // C
    [10, 4, 8, 0]  // D
];

```

## Hidden Test Cases

```javascript
// Hidden test case 1
let distances4 = [
    [0, 2, 9, 10],
    [1, 0, 6, 4],
    [15, 7, 0, 8],
    [6, 3, 12, 0]
];
travellingSalesmanProblem(distances4); // Expected output: 21
```

displayas = travellingSalesmanProblem(distances4);

distances4 =

```javascript
[
    //A   B   C   D
    [0, 2, 9, 10], // A
    [1, 0, 6, 4], // B
    [15, 7, 0, 8], // C
    [6, 3, 12, 0]  // D
];
```

```javascript
// Hidden test case 2
let distances5 = [
    [0, 5, 2, 3],
    [10, 0, 15, 5],
    [13, 4, 0, 20],
    [7, 14, 8, 0]
];
travellingSalesmanProblem(distances5); // Expected output: 27
```

displayas = travellingSalesmanProblem(distances5);

distances5 =

```javascript
[
    //A   B   C   D
    [0, 5, 2, 3], // A
    [10, 0, 15, 5], // B
    [13, 4, 0, 20], // C
    [7, 14, 8, 0]  // D
];
```

```javascript
// Hidden test case 3
let distances6 = [
    [0, 1, 3, 4],
    [2, 0, 5, 6],
    [7, 8, 0, 9],
    [10, 11, 12, 0]
];
travellingSalesmanProblem(distances6); // Expected output: 18
```

displayas = travellingSalesmanProblem(distances6);

distances6 =

```javascript
[
    //A   B   C   D
    [0, 1, 3, 4], // A
    [2, 0, 5, 6], // B
    [7, 8, 0, 9], // C
    [10, 11, 12, 0]  // D
];
```

# Next

# Tags

Graph Theory, Dynamic Programming, Optimization, Travelling Salesman Problem, Algorithms, Computer Science