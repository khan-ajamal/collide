import { useCallback } from "react";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { ViewUpdate } from "@codemirror/view";

const Editor = () => {
    const onChange = useCallback((value: string, viewUpdate: ViewUpdate) => {
        console.log("value:", value);
    }, []);

    return (
        <CodeMirror
            minHeight="100vh"
            className="text-lg min-h-screen"
            extensions={[python()]}
            onChange={onChange}
            theme="dark"
        />
    );
};

export default Editor;
