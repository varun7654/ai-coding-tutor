# Binary Search Tree Traversal

# Context

Binary Search Trees (BST) are a fundamental data structure in computer science. They allow for efficient insertion,
deletion, and lookup operations. One common operation performed on BSTs is traversal, where each node in the tree is
visited in a specific order.

## Example 1

Consider a BST with the following nodes: 8, 3, 10, 1, 6, 14, 4, 7, 13. The BST would look like this:

```text
     8
    / \
   3   10
  / \   \
 1   6   14
/     \   \
4      7   13
```

A common traversal method is the in-order traversal, which visits the nodes in ascending order. The in-order traversal
for this BST would be: 1, 3, 4, 6, 7, 8, 10, 13, 14.

# Description

In these test cases, we're creating a binary search tree with the `TreeNode` class. The `root` is the topmost node in
the tree, from which all other nodes descend. In this case, the root node has a value of `8`.

## Let's try this

Write a function that performs an in-order traversal of a BST. The function should take the root of the BST as input and
return an array of the nodes in ascending order.

# Problem

```javascript
function inOrderTraversal(root) {
// Your code here
}
```

# Solution

```javascript
function inOrderTraversal(root) {
    let result = [];

    function traverse(node) {
        if (node.left) traverse(node.left);
        result.push(node.val);
        if (node.right) traverse(node.right);
    }

    traverse(root);
    return result;
}
```

# Test Cases

```javascript
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = this.right = null;
    }
}

let root = new TreeNode(8);
root.left = new TreeNode(3);
root.right = new TreeNode(10);
root.left.left = new TreeNode(1);
root.left.right = new TreeNode(6);
root.right.right = new TreeNode(14);
root.left.right.left = new TreeNode(4);
root.left.right.right = new TreeNode(7);
root.right.right.left = new TreeNode(13);
inOrderTraversal(root);
```

displayas = inorderTraversal(root);

# Hidden Test Cases

```javascript
let random = Math.floor(Math.random() * 20) - 10;
inOrderTraversal(random);
```

repeat=25

# Next

# Tags

Binary Search Tree, Traversal, Medium