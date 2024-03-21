import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Specify the directory where your problem files are located
const problemDir = path.join(__dirname, 'public', 'problems');

let problemLocations: ({ problemName: string, id: string })[] = [];

async function readDirectory(directory: string) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const absolutePath = path.join(directory, file);

        if (fs.statSync(absolutePath).isDirectory()) {
            await readDirectory(absolutePath);
        } else {
            const firstLine = await readFirstLine(absolutePath);
            let problemName = firstLine.slice(2, -1);
            let problemId = absolutePath.slice(problemDir.length, -3);
            problemLocations.push({problemName, id: problemId});

        }
    }
}

async function readFirstLine(file: string): Promise<string> {
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

 readDirectory(problemDir);

console.log(problemLocations);