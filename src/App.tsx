import React from 'react';
import './App.css';


function Header() {
    return (
        <h1 className = "App-header">Header</h1>
    )
}

function Problem() {
    return (
        <h2>Problem</h2>
    )

}

function App() {
  return (
    <div className="App">
      <Header />
      <Problem />
    </div>
  );
}

export default App;
