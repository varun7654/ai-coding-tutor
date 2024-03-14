import React from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";


export function getEditor(lang: string, onChange: (value: string) => void) {

    try {
        require(`ace-builds/src-noconflict/mode-${lang}`);
        require(`ace-builds/src-noconflict/snippets/${lang}`);
    } catch (e) {
        console.log(`Language ${lang} not supported. Assuming js`, e)
        lang = "javascript";
        require(`ace-builds/src-noconflict/mode-${lang}`);
        require(`ace-builds/src-noconflict/snippets/${lang}`);
    }


    return <AceEditor
        placeholder={""}
        mode={lang}
        theme="github"
        onLoad={() => onChange("")}
        onChange={onChange}
        width={"90%"}
        name="editor"
        fontSize="1.1em"
        setOptions={{
            useWorker: false,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2
        }}
        style={{
            border: "1px solid #d3d3d3",
            borderRadius: "5px",
            width: "95%",
            maxWidth: "50em"
        }}
    />
}