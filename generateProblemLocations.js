const fs = require('fs');
const path = require('path');
const readline = require('readline');

/*
    * This script generates a JSON file that contains the locations of all the problems.
    * The JSON file is used by the frontend to display the problems in the correct order.
    * In each directory, there should be a meta.json file that contains the following fields:
    * - displayStyle: 'all' | 'whitelist' | 'blacklist'
    * - whitelist: string[] (only used if displayStyle is 'whitelist')
    * - blacklist: string[] (only used if displayStyle is 'blacklist')
    * - title: string
    * - description: string
    * - weight: number (higher weight means the directory will be displayed first)
    * If a directory does not have a meta.json file, the default values will be used.
    * The default values are:
    * - displayStyle: 'all'
    * - title: the name of the directory
    * - description: ''
    * - weight: 0
    * The JSON file will be saved in the public folder as problem_locations.json
 */
class Problem {
    constructor(problemName, problemId) {
        this.problemName = problemName;
        this.problemId = problemId;
    }
}

class ProblemDirectory {
    constructor(directory, meta) {
        this.directory = directory;
        this.meta = meta;
        this.files = [];
    }

    addFile(file) {
        this.files.push(file);
    }
}

async function main() {
    const problemDir = path.posix.join(__dirname, 'public', 'problems');


    async function readDirectory(directory, currentDirectory) {
        // Check if the meta.json file has the required fields
        let meta = currentDirectory.meta;
        if (!meta.displayStyle) {
            meta.displayStyle = 'all';
        }
        if (meta.displayStyle === 'whitelist' && !meta.whitelist) {
            meta.whitelist = [];
        }
        if (meta.displayStyle === 'blacklist' && !meta.blacklist) {
            meta.blacklist = [];
        }
        if (!meta.title) {
            meta.title = directory.split("/").pop().toLowerCase();
        }
        if (!meta.description) {
            meta.description = '';
        }
        if (!meta.weight) {
            meta.weight = 0;
        }

        const files = fs.readdirSync(directory);

        for (const file of files) {
            const absolutePath = path.posix.join(directory, file);

            if (fs.statSync(absolutePath).isDirectory()) {
                const metaPath = path.posix.join(absolutePath, 'meta.json');
                let meta = {};
                if (fs.existsSync(metaPath)) {
                    meta = JSON.parse(fs.readFileSync(metaPath));
                }

                let newDir = new ProblemDirectory(absolutePath.slice(problemDir.length), meta)
                currentDirectory.addFile(newDir);
                await readDirectory(absolutePath, newDir);
            } else {
                if (!absolutePath.endsWith('.md')) {
                    continue;
                }

                const firstLine = await readFirstLine(absolutePath);
                let problemName = firstLine.trim().slice(2);
                let problemId = absolutePath.slice(problemDir.length, -3);

                let shortProblemId = problemId.split('/').pop().split('.')[0];

                let displayStyle = currentDirectory.meta.displayStyle;
                if (displayStyle === 'whitelist' && !currentDirectory.meta.whitelist.includes(shortProblemId)) {
                    continue;
                }
                if (displayStyle === 'blacklist' && currentDirectory.meta.blacklist.includes(shortProblemId)) {
                    continue;
                }

                currentDirectory.addFile(new Problem(problemName.trim(), problemId));

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

    let parent = new ProblemDirectory("/", {});

    await readDirectory(problemDir, parent);

    sortProblems(parent);

    function sortProblems(problemDirectory) {
        problemDirectory.files.sort((a, b) => {
            // Recursively sort directories
            if (a.meta) {
                sortProblems(a);
            }
            if (b.meta) {
                sortProblems(b);
            }

            if (!a.meta && !b.meta) {
                // Both are files, sort by their problemId
                return a.problemId.localeCompare(b.problemId);
            }
            if (!a.meta) {
                // a is a file, sort b before a
                return 1;
            }
            if (!b.meta) {
                // b is a file, sort a before b
                return -1;
            }

            if (a.meta.weight === b.meta.weight) {
                return a.meta.title.localeCompare(b.meta.title);
            }
            return b.meta.weight - a.meta.weight;
        });
    }

    fs.writeFileSync(path.posix.join(__dirname, 'public', 'problem_locations.json'), JSON.stringify(parent));
}

main();



