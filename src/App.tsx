import React from 'react';
import './App.css';
import 'highlight.js/styles/atom-one-light.min.css';
import {Problem} from "./problem/Problem";

function Header() {
    return (
        <h1 className = "App-header">Header</h1>
    )
}

function App() {
  return (
    <div className="App">
      <Header />
      <Problem id={window.location.href + ".md"} />
    </div>
  );
}

export default App;
