#  Merge Sorted Arrays

# Context
Merging sorted arrays is a common task in computer science and software development. It's a fundamental part of the merge sort algorithm, and it's also useful in many other contexts. For example, if you have multiple sorted lists of data that you want to combine into a single sorted list, you would need to merge the lists.

## Example
Consider two sorted arrays: `[1, 3, 5, 7]` and `[2, 4, 6, 8]`. The merged array would be: `[1, 2, 3, 4, 5, 6, 7, 8]`.

# Description
## Let's try this
Write a function that merges two sorted arrays into a single sorted array. The function should take two arrays as input and return a new array that contains all the elements from both input arrays, in sorted order.

# Problem
```javascript
function mergeSortedArrays(arr1, arr2) {
    // Your code here
}
function mergeSortedArrays(arr1, arr2) {
    let merged = [...arr1, ...arr2];
    return merged.sort((a, b) => a - b);
}
mergeSortedArrays([1, 3, 5, 7], [2, 4, 6, 8]);
mergeSortedArrays([10, 20, 30], [15, 25, 35]);
mergeSortedArrays([1, 1, 1, 1], [2, 2, 2, 2]);
mergeSortedArrays([], [1, 2, 3, 4]);
This markdown file contains a medium level problem about merging sorted arrays. It includes a problem description, context, an example, a problem function, a solution, test cases, what to do next, and tags. You can replace the placeholders with the actual content for your problem.