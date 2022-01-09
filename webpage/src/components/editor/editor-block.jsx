import React from "react";

import {EditorBlock} from "draft-js";

import * as styles from "./line.module.css";

export const CodeSpan = (props) => {
    const entity = props.contentState.getEntity(props.entityKey)
    const data = entity.getData()
    return (
        <span data-offset-key={props.offsetkey} className={`${data.classList.value}`}>
            {props.children}
        </span>
    )
}

export const Line = (props) => {
    const blockMap = props.contentState.getBlockMap().toArray();
    const blockKey = props.block.key;
    const lineNumber =
        blockMap.findIndex((block) => blockKey === block.key) + 1;
    return (
        <div className={styles.line} data-line={lineNumber}>
            <div className={styles.lineText}>
                <EditorBlock {...props} />
            </div>
        </div>
    );
};
