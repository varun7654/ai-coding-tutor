import React from 'react';
import './App.css';
import { useState } from 'react';



function Header() {
    return (
        <h1 className = "App-header">Header</h1>
    )
}



function Problem({ id } : { id: string }) {
    const [problemData, setProblemData] = useState({
        title: 'Loading...',
        description: 'test description',
        tests: ["test1", "test2", "test3"],
        testExpectedResults: ["1, 2, 3"],
        displayAbove: 'testing display above',
        displayBelow: 'testing display below',
        solution: 'solution goes here'
    });
    const [loading, setLoading] = useState(true);
    if (loading) {
        setLoading(false);
        fetch(id)
            .then(r => r.text())
            .then(text => {
                /*
                description = This is a test desc
                displayAbove = function findNthFibonacci(n){
                displayBelow = }
                solution = let a = 0, b = 1, c;
    if(n == 0) return a;
    for(let i = 2; i <= n; i++){
        c = a + b;
        a = b;
        b = c;
    }
    return b;
                 */
                const descriptionMatch = text.match("\\/\\/startdesc\\n(.*\\n)*\\/\\/enddesc");
                const displayMatch = text.match(/\/\/displaystart\n([\s\S]*?)\n\/\/displayend/);
                const solutionMatch = text.match(/\/\/usercode\n([\s\S]*?)\n\/\/endsolution/);
                const testsMatch = text.match(/\/\/teststart\n([\s\S]*?)\n\/\/testend/);

                const description = descriptionMatch ? descriptionMatch[1] : '';
                const display = displayMatch ? displayMatch[1] : '';
                const solution = solutionMatch ? solutionMatch[1] : '';
                const tests = testsMatch ? testsMatch[1].split('\n').filter(Boolean) : [];

                console.log("desc match: " + descriptionMatch);

                setProblemData({
                    title: id,
                    description,
                    tests,
                    testExpectedResults: [],
                    displayAbove: display,
                    displayBelow: '',
                    solution
                });
            });
    }

    return (
        <div>
            <h2>{problemData.title}</h2>
            <p>{problemData.description}</p>
            <pre>{problemData.displayAbove}</pre>
            <pre>{problemData.solution}</pre>
            <pre>{problemData.tests.join('\n')}</pre>
        </div>
    );



}

function App() {
  return (
    <div className="App">
      <Header />
      <Problem id="problems/test.js" />
    </div>
  );
}

export default App;
