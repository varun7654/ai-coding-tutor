import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";
import {hydrate, render} from "react-dom";

const rootElement = document.getElementById('root');


if (rootElement == null) {
    throw new Error("Root element not found");
}


if (rootElement.hasChildNodes()) {
    hydrate(<App/>, rootElement);
} else {
    // eslint-disable-next-line
    render(<React.StrictMode>
        <DevSupport ComponentPreviews={ComponentPreviews}
                    useInitialHook={useInitial}
        >
            <App/>
        </DevSupport>
    </React.StrictMode>, rootElement);

}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
