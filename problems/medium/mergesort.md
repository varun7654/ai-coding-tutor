# Merge Sort

## Context
Merge Sort is a fundamental algorithm in computer science. It is a divide and conquer algorithm that was invented by John von Neumann in 1945. Merge Sort is efficient, stable and works well for large datasets.

## Example
Consider an unsorted array: `[38, 27, 43, 3, 9, 82, 10]`. After applying the merge sort algorithm, the array becomes: `[3, 9, 10, 27, 38, 43, 82]`.

## Description
Write a function that sorts an array of numbers using the merge sort algorithm. The function should take an unsorted array as input and return a new array that contains all the elements from the input array, in sorted order.

## Problem
```javascript
function mergeSort(arr) {
    // Your code here
}
```
function mergeSort(arr) {
if (arr.length <= 1) {
return arr;
}

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
let result = [], leftIndex = 0, rightIndex = 0;

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
console.log(mergeSort([38, 27, 43, 3, 9, 82, 10])); // [3, 9, 10, 27, 38, 43, 82]
console.log(mergeSort([5, 3, 8, 4, 2, 6, 1, 7])); // [1, 2, 3, 4, 5, 6, 7, 8]
console.log(mergeSort([1, 2, 3, 4, 5, 6, 7, 8])); // [1, 2, 3, 4, 5, 6, 7, 8]
console.log(mergeSort([8, 7, 6, 5, 4, 3, 2, 1])); // [1, 2, 3, 4, 5, 6, 7, 8]

let random = Math.floor(Math.random() * 100) - 50;
console.log(mergeSort(Array.from({length: random}, () => Math.floor(Math.random() * 100))));