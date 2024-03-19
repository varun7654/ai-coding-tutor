// generateProblemIds.js
const fs = require('fs');
const path = require('path');

// Specify the directory where your problem files are located
const problemDir = path.join(__dirname, 'src', 'problems');

fs.readdir(problemDir, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    const problemIds = files.map(file => path.basename(file, path.extname(file)));

    const output = `export default ${JSON.stringify(problemIds)};`;

    fs.writeFile(path.join(__dirname, 'src', 'problemIds.js'), output, 'utf8', err => {
        if (err) {
            console.error('Error writing problemIds.js', err);
        } else {
            console.log('Successfully wrote problemIds.js');
        }
    });
});