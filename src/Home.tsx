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
        <div>
            <h1>Hi and welcome to our page</h1>
            {Array.from(groupedData.entries()).map(([category, problems]) => (
                <div key={category}>
                    <h2>{category}</h2>
                    {problems.map((item, index) => (
                        <div key={index}>
                            <Link to={"/Problem" + item.id} className={'problem-link'} ><h3>{item.problemName}</h3></Link>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Home;