const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Specify the directory where your problem files are located
async function main() {
    const problemDir = path.posix.join(__dirname, 'public', 'problems');

    let problemLocations = [];

    async function readDirectory(directory) {
        const files = fs.readdirSync(directory);

        for (const file of files) {
            const absolutePath = path.posix.join(directory, file);

            if (fs.statSync(absolutePath).isDirectory()) {
                await readDirectory(absolutePath);
            } else {
                const firstLine = await readFirstLine(absolutePath);
                let problemName = firstLine.trim().slice(2);
                let problemId = absolutePath.slice(problemDir.length, -3);

                problemLocations.push({problemName, id: problemId});

            }
        }
    }

    async function readFirstLine(file) {
        const fileStream = fs.createReadStream(file);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            // Close the readline Interface to stop iterating over the lines.
            rl.close();
            // Return the first line.
            return line;
        }

        return '';
    }

    await readDirectory(problemDir);

    fs.writeFileSync(path.posix.join(__dirname, 'public', 'problem_locations.json'), JSON.stringify(problemLocations));
}

main();