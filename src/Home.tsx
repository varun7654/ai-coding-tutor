import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

class ProblemData {
    problemName: string = "";
    id: string = "";
}

class ProblemDirData {
    "directory": string = "";
    "meta": {
        "displayStyle": string
        "title": string
        "description": string
        "weight": number
    }
    "files": (ProblemData | ProblemDirData)[]
}

function getCategoryFromFilePath(id: string): string {
    if (!id) {
        return 'nothing';
    }
    const parts = id.split('/');
    if (parts.length < 2) {
        return 'nothing';
    }
    return parts[parts.length - 2];
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function Home() {
    const [data, setData] = useState(null as ProblemDirData | null);

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/problem_locations.json")
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return await (response.json()) as ProblemDirData
            })
            .then(data => {
                setData(data);
            })
            .catch(error => {
                console.error('Error loading available problems', error);
            });
    }, []);


    function getProblemFolderAsJSX(data: (ProblemData | ProblemDirData)[]) {
        return <div>
            {data.map((item, index) => {
                if ('directory' in item) {
                    return <div key={index}>
                        <div className="pb-5">
                            <div className="text-2xl font-bold"> {item.meta.title} </div>
                            <div className=""> {item.meta.description} </div>
                            <div className="pl-4"> {getProblemFolderAsJSX(item.files)} </div>
                        </div>
                    </div>
                } else {
                    return <div key={index}>
                        <Link to={"/Problem" + item.id} className={'text-blue-500 underline text-lg'}>
                            {item.problemName}
                        </Link>
                    </div>
                }
            })}
        </div>
    }

    return (
        <div className="flex justify-between">
            <div className="w-7/10 pl-4">
                <h1 className="text-4xl">Hi and welcome to WeCode!</h1>
                <p>This is a webpage that helps beginners practice coding problems in JavaScript. We are so excited for
                    you to learn!</p>
                <div className="w-2/3">
                    {getProblemFolderAsJSX(data?.files || [])}
                </div>
            </div>
            <div className="w-1/4 p-4 border-l border-gray-300">
                <h2 className="text-2xl">How it works</h2>
                <p>We have organized practice problems on levels of introductory, medium, and hard.</p>
                <p>Each problem will give you enough backround informatuion to get started as well as input, output, and
                    test cases.</p>
                <p>Click on a problem to see the details and try to solve it.</p>
                <p>After you solve a problem, you can see the solution and explanation.</p>
                <p>Feel free to ask for help if you are stuck. Our help button will provide you with feedback
                    specific to your code without giving you the answer!</p>
                <p>Good luck and have fun coding!</p>
            </div>
        </div>
    )
}

export default Home;