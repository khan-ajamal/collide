import React from "react";

import {
    Editor as DraftEditor,
    EditorState,
    getDefaultKeyBinding,
    Modifier,
} from "draft-js";

import { Line } from "./editor-block";

import "draft-js/dist/Draft.css";
import "./custom-editor.css";
import { brackets } from "./constant";

const Editor = () => {
    const [editorState, setEditorState] = React.useState(() =>
        EditorState.createEmpty()
    );

    const blockRenderer = () => {
        return {
            component: Line,
        };
    };

    const keyBindingFn = (e) => {
        let command;
        switch (e.keyCode) {
            case 9:
                command = "add-tab";
                break;
            case 219:
                command = "open-square-bracket";
                if (e.shiftKey) command = "open-curly-bracket";
                break;
            case 57:
                if (e.shiftKey) command = "open-bracket";
                break;
            default:
                command = getDefaultKeyBinding(e);
        }
        return command;
    };

    const _getContentWithBracket = (bracketType) => {
        let selection = editorState.getSelection();
        let currentState = editorState.getCurrentContent();

        let newContentState;
        if (!selection.isCollapsed()) {
            let focusKey = selection.getFocusKey();
            let anchorKey = selection.getAnchorKey();
            let isBackward = selection.getIsBackward();
            let focusOffset = selection.getFocusOffset();
            let anchorOffset = selection.getAnchorOffset();

            let openOffset = isBackward ? focusOffset : anchorOffset;
            let closeOffset = isBackward ? anchorOffset : focusOffset;

            let openBlockKey = isBackward ? focusKey : anchorKey;
            let closeBlockKey = isBackward ? anchorKey : focusKey;

            let newOpenSelection = selection.merge({
                anchorOffset: openOffset,
                focusOffset: openOffset,
                anchorKey: openBlockKey,
                focusKey: openBlockKey,
            });

            newContentState = Modifier.insertText(
                currentState,
                newOpenSelection,
                bracketType.open
            );

            let newCloseSelection = selection.merge({
                anchorOffset:
                    openBlockKey === closeBlockKey
                        ? closeOffset + 1
                        : closeOffset,
                focusOffset:
                    openBlockKey === closeBlockKey
                        ? closeOffset + 1
                        : closeOffset,
                anchorKey: closeBlockKey,
                focusKey: closeBlockKey,
            });
            newContentState = Modifier.insertText(
                newContentState,
                newCloseSelection,
                bracketType.close
            );
        } else {
            newContentState = Modifier.insertText(
                currentState,
                selection,
                `${bracketType.open}${bracketType.close}`
            );
        }

        let newEditorState = EditorState.push(editorState, newContentState);
        let updatedSelection = newEditorState.getSelection();
        let newSelection = updatedSelection.merge({
            anchorOffset: updatedSelection.getAnchorOffset() - 1,
            focusOffset: updatedSelection.getFocusOffset() - 1,
        });

        return EditorState.forceSelection(newEditorState, newSelection);
    };

    const _addIndentation = () => {
        let currentState = editorState.getCurrentContent();
        let selection = editorState.getSelection();

        let newContentState = currentState;
        if (selection.isCollapsed()) {
            newContentState = Modifier.insertText(
                currentState,
                selection,
                "    "
            );
        } else {
            let focusKey = selection.getFocusKey();
            let anchorKey = selection.getAnchorKey();
            let isBackward = selection.getIsBackward();
            let openBlockKey = isBackward ? focusKey : anchorKey;
            let closeBlockKey = isBackward ? anchorKey : focusKey;

            let newSelection;
            if (openBlockKey === closeBlockKey) {
                newSelection = selection.merge({
                    anchorKey: openBlockKey,
                    focusKey: openBlockKey,
                    anchorOffset: 0,
                    focusOffset: 0,
                });
                newContentState = Modifier.insertText(
                    currentState,
                    newSelection,
                    "    "
                );
            } else {
                let encounteredFirstBlock = false;
                for (const block of currentState.getBlocksAsArray()) {
                    let blockKey = block.getKey();
                    if (!encounteredFirstBlock && blockKey === openBlockKey) {
                    } else if (blockKey === closeBlockKey) {
                        newSelection = selection.merge({
                            anchorKey: blockKey,
                            focusKey: blockKey,
                            anchorOffset: 0,
                            focusOffset: 0,
                        });
                        newContentState = Modifier.insertText(
                            newContentState,
                            newSelection,
                            "    "
                        );
                        break;
                    }
                    newSelection = selection.merge({
                        anchorKey: blockKey,
                        focusKey: blockKey,
                        anchorOffset: 0,
                        focusOffset: 0,
                    });
                    newContentState = Modifier.insertText(
                        newContentState,
                        newSelection,
                        "    "
                    );
                }
            }
        }
        return EditorState.push(editorState, newContentState);
    };

    const handleKeyCommand = (command) => {
        let newEditorState;
        switch (command) {
            case "add-tab":
                newEditorState = _addIndentation();
                break;
            case "open-curly-bracket":
                newEditorState = _getContentWithBracket(brackets.curly);
                break;
            case "open-square-bracket":
                newEditorState = _getContentWithBracket(brackets.square);
                break;
            case "open-bracket":
                newEditorState = _getContentWithBracket(brackets.normal);
                break;
            default:
                return "not-handled";
        }
        setEditorState(newEditorState);
        return "handled";
    };

    return (
        <DraftEditor
            placeholder="# add text"
            editorState={editorState}
            onChange={setEditorState}
            blockRendererFn={blockRenderer}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
        />
    );
};

export default Editor;
