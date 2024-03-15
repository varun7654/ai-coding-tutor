import React from "react";
import "./index.css"
import {Header} from "./App";
import {Link} from "react-router-dom"; // Import Link from react-router-dom

function Home() {
    return (
        <div>
            <h1>Hi and welcome to our page</h1>
            <Link to="/Problem">Go to Problem Page</Link> // Use Link to navigate to Problem Page
        </div>
    )
}
export default Home;