import React, { useEffect, useState } from "react";
import "./index.css"
import {Header} from "./App";
import {Link} from "react-router-dom"; // Import Link from react-router-dom

class ProblemData {
    problemName : string = "";
    id: string = "";
}

function Home() {
    const [data, setData] = useState(null as ProblemData[] | null);

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + "/problem_locations.json")
            .then(async response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return await (response.json()) as ProblemData[]// Use text() instead of json() as we're fetching a markdown file
            })
            .then(data => {
                setData(data);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }, []);

    return (
        <div>
            <h1>Hi and welcome to our page</h1>
            {/* Map over the data array and generate JSX elements for each item */}
            {data && data.map((item, index) => (
                <div key={index}>
                    <h2>{item.problemName}</h2>
                    <Link to={"/Problem" + item.id}>Go to Problem Page</Link>
                </div>
            ))}
        </div>
    )
}
export default Home;