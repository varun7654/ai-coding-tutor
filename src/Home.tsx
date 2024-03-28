import React, {useEffect, useState} from "react";
import "./Home.css"
import {Link} from "react-router-dom";

class ProblemData {
    problemName: string = "";
    id: string = "";
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

function Home() {
    const [data, setData] = useState(null as ProblemData[] | null);
    const [groupedData, setGroupedData] = useState(new Map<string, ProblemData[]>());

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/problem_locations.json")
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return await (response.json()) as ProblemData[]
            })
            .then(data => {
                setData(data);
                const map = new Map<string, ProblemData[]>();
                data.forEach(item => {
                    const category = getCategoryFromFilePath(item.id);
                    if (!map.has(category)) {
                        map.set(category, []);
                    }
                    map.get(category)!.push(item);
                });
                setGroupedData(map);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }, []);

    return (
        <div className="content-container">
            <div className="main-content">
                <h1>Welcome to</h1>
                <p className={"wecode-title"}>WeCode</p>
                <p>This is a webpage that helps beginners practice coding problems in JavaScript. We are so excited for
                    you to learn! </p>
                {Array.from(groupedData.entries()).map(([category, problems]) => (
                    <div key={category}>
                        <h2>{category}</h2>
                        {problems.map((item, index) => (
                            <div key={index}>
                                <Link to={"/Problem" + item.id} className={'problem-link'}><h3>{item.problemName}</h3>
                                </Link>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="explanation">
                <h2>How it works</h2>
                <p>We have organized practice problems on levels of introductory, medium, and hard.</p>
                <p>Each problem will give you enough background information to get started as well as input, output, and
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