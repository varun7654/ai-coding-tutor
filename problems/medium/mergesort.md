# Merge Sort

## Context

The merge sort algorithm is a divide and conquer algorithm that works by dividing the input array into two halves,
sorting the two halves, and then merging them back together.

# Description

## It is a recursive algorithm that uses the following steps:

1. Divide the array into two halves.
2. Recursively sort the two halves.
    - If the array has only one element, return the array. (Base case)
    - Otherwise, divide the array into two halves and recursively sort each half
3. Merge the two halves back together in sorted order.
    - Note you'll probably want to write a helper function to merge the two halves together.
    - The `merge` function should take two arrays as arguments and return a single sorted array.
    - How can you use the fact that the two halves are already sorted to merge them together efficiently?
4. Return the sorted array.

## Useful Information:

- You can use the `slice` method to divide the array into two halves.
    - Example: `[1, 2, 3, 4, 5].slice(0, 3)` returns `[1, 2, 3]`.
- You can use the `concat` method to merge two arrays together.
    - Example: `[1, 2].concat([3, 4])` returns `[1, 2, 3, 4]`.

<p>

**Write a function that sorts an array of numbers using the merge sort algorithm.**

# Problem

```javascript
function mergeSort(arr) {
    // Your code here
}
```

# Solution

```javascript
function mergeSort(arr) {
    function merge(left, right) {
        let result = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
            if (left[leftIndex] < right[rightIndex]) {
                result.push(left[leftIndex]);
                leftIndex++;
            } else {
                result.push(right[rightIndex]);
                rightIndex++;
            }
        }

        return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
    }

    if (arr.length <= 1) {
        return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    let leftArr = mergeSort(left);
    let rightArr = mergeSort(right);

    return merge(leftArr, rightArr);
}
```

# Test Cases

```javascript
let arr = [38, 27, 43, 3, 9, 82, 10];
mergeSort(arr)
```

```javascript
let arr = [-12, 3, 0, 9, 1, 2, 5, 4, 6, 8, 7, 10, 11, 13, 12, 15, 14];
mergeSort(arr);
```

```javascript
let arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
mergeSort(arr)
```

```javascript
let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
mergeSort(arr)
```

```javascript
let arr = [1000, 354, 23, 565, 10, -20, 3, 4, 6, 1004, 35, 453, 14, 657];
mergeSort(arr)
```

# Hidden Test Cases

```javascript
let len = Math.floor(Math.random() * 25 + 1);
let arr = Array.from({length: len}, () => Math.floor(Math.random() * 1000));
mergeSort(arr);
```

repeat = 100