# Knapsack Problem

# Context

The knapsack problem is a problem in combinatorial optimization. Given a set of items, each with a weight and a value,
determine the number of each item to include in a collection so that the total weight is less than or equal to a given
limit and the total value is as large as possible.

# Example

Consider a set of items: `{A, B, C, D}` with weights `{10, 20, 30, 40}` and values `{60, 100, 120, 130}`. The maximum
weight that can be carried is `50`. The maximum value that can be obtained is `220` by taking items `A` and `C`.

# Description

Write a function that takes an array of objects (each object containing an item's weight and value) and a maximum
weight, and returns the maximum value that can be obtained by selecting a combination of items such that the total
weight is less than or equal to the maximum weight.

# Problem

```javascript
function knapsackProblem(items, maxWeight) {
    // Your code here
}
```

# Solution

```javascript
function knapsackProblem(items, maxWeight) {
    const n = items.length;
    const dp = Array(n + 1).fill().map(() => Array(maxWeight + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= maxWeight; w++) {
            if (items[i - 1].weight <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    items[i - 1].value + dp[i - 1][w - items[i - 1].weight]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    return dp[n][maxWeight];
}
```

# Test Cases

```javascript

// Test case 1
let items1 = [
    {weight: 10, value: 60},
    {weight: 20, value: 100},
    {weight: 30, value: 120}
];
let maxWeight1 = 50;
knapsackProblem(items1, maxWeight1); // Expected output: 220
```

```javascript
// Test case 2
let items2 = [
    {weight: 5, value: 30},
    {weight: 10, value: 50},
    {weight: 15, value: 70}
];
let maxWeight2 = 20;
knapsackProblem(items2, maxWeight2); // Expected output: 100
```

```javascript
// Test case 3
let items3 = [
    {weight: 1, value: 1},
    {weight: 2, value: 2},
    {weight: 3, value: 3}
];
let maxWeight3 = 2;
knapsackProblem(items3, maxWeight3); // Expected output: 3

```

# Hidden Test Cases

```javascript
let hiddenItems1 = [
    {weight: 2, value: 3},
    {weight: 3, value: 4},
    {weight: 4, value: 5}
];
let hiddenMaxWeight1 = 5;
knapsackProblem(hiddenItems1, hiddenMaxWeight1); // Expected output: 7
```

```javascript
let hiddenItems2 = [
    { weight: 1, value: 10 },
    { weight: 2, value: 20 },
    { weight: 3, value: 30 }
];
let hiddenMaxWeight2 = 4;
 knapsackProblem(hiddenItems2, hiddenMaxWeight2); // Expected output: 40

