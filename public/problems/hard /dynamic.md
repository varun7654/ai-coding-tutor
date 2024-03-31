# Knapsack Problem

## Context
The knapsack problem is a problem in combinatorial optimization. Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible.

## Example
Consider a set of items: `{A, B, C, D}` with weights `{10, 20, 30, 40}` and values `{60, 100, 120, 130}`. The maximum weight that can be carried is `50`. The maximum value that can be obtained is `220` by taking items `A` and `C`.

## Description
Write a function that takes an array of objects (each object containing an item's weight and value) and a maximum weight, and returns the maximum value that can be obtained by selecting a combination of items such that the total weight is less than or equal to the maximum weight.

## Problem
```javascript
function knapsackProblem(items, maxWeight) {
    // Your code here
}
```

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