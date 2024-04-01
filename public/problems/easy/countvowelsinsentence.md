# Count Vowels In a Sentence

# Description

Write a function that takes a sentence as a parameter and returns the number of vowels in the sentence.
You can assume that the sentence will only contain lowercase letters, spaces, and punctuation.

`sentence` is a string that represents the sentence.

## Hints

- You'll want to use string.includes(character) to check if a character is a vowel.
- You'll want to loop through each character in the sentence.

# Problem

```javascript
function countVowels(sentence) {
    // Your code here
}
```

# Solution

```javascript
function countVowels(sentence) {
    let vowels = 'aeiou';
    let count = 0;
    for (let i = 0; i < sentence.length; i++) {
        if (vowels.includes(sentence[i])) {
            count++;
        }
    }
    return count;
}
```

# Test Cases

```javascript
countVowels('hello world');
```

```javascript
countVowels('hello world.');
```

```javascript
countVowels('hello world, how are you?');
```

```javascript
countVowels('aeiou');
```

```javascript
countVowels('aeiouaeiouaeiou');
```

```javascript
countVowels('qwrtypsdfghjklzxcvbnm');
```

# Hidden Test Cases

```javascript
let sentence = '';
let length = Math.floor(Math.random() * 100);
for (let i = 0; i < length; i++) {
    let random = Math.floor(Math.random() * 26);
    sentence += String.fromCharCode(97 + random);
}
countVowels(sentence);
```

repeat=100