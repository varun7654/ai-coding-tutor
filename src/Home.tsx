import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Link as ScrollLink} from 'react-scroll'

class ProblemData {
    problemName: string = "";
    problemId: string = "";
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
                        <Link to={"/Problem" + item.problemId} className={'text-blue-500 underline text-lg'}>
                            {item.problemName}
                        </Link>
                    </div>
                }
            })}
        </div>
    }

    return (
        <div>
            <div className="flex justify-between h-[calc(100vh*0.60)] bg-white-pink">
                <div className="flex justify-center items-center">
                    <div className="-mt-16 w-2/3">
                        <div className="text-3xl text-black font-bold">Welcome to</div>
                        <div className="text-9xl font-extrabold text-bright-purple -mt-5">WeCode</div>
                        <div className="text-xl text-black font-semibold mt-5 pl-4">The Smart Way to Learn to Code</div>
                        <ScrollLink to="problems" smooth={true} duration={500}>
                            <div className="text-xl text-bright-blue underline font-semibold pl-4">Start Learning Now
                            </div>
                        </ScrollLink>
                    </div>
                </div>
                <div className="flex w-1/3 justify-center items-center">
                    <div className=" text-black font-bold"></div>
                </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 72" className="mb-5">
                <path fill="#f8e6f7"
                      d="M0,60.56c55.63-30.1,102.12-38.64,133.59-41.06c37.46-2.88,94.56,7.7,207.25,28.99
                        c72.83,13.76,91.25,18.65,123.67,12.56c55.51-10.42,56.68-35.11,104.35-37.2c52.67-2.31,79.26,26.62,124.64,10.63
                        c17.13-6.04,29.35-15.8,36.71-22.71L720,0H0V60.56z"></path>
            </svg>
            <div className="ml-5">
                <p>This is a webpage that helps beginners practice coding problems in JavaScript. We are so excited for
                    you to learn!</p>
                <div id="problems" className="w-2/3 pb-96">
                    {getProblemFolderAsJSX(data?.files || [])}
                </div>
            </div>
        </div>
    )
}

export default Home;