import React from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/ext-language_tools";


export default function Editor(
    {lang, onChange, defaultValue = ""}: {
        lang: string,
        onChange: (value: string) => void,
        defaultValue: string
    }) {

    return <AceEditor
        placeholder={""}
        defaultValue={defaultValue}
        mode={lang}
        theme="github_dark"
        onChange={onChange}
        name="editor"
        fontSize="1.1em"
        width="100%"
        setOptions={{
            useWorker: false,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
            highlightActiveLine: false
        }}
        style={{
            border: "0px solid #d3d3d3",
            borderRadius: "5px",
            height: "90%",
        }}
    />
}