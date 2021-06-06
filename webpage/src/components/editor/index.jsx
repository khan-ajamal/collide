import React, { useEffect } from "react";

import {
    Editor as DraftEditor,
    EditorState,
    Modifier,
    getDefaultKeyBinding,
    CompositeDecorator,
    CharacterMetadata
} from "draft-js";
import Prism from 'prismjs';
import Immutable from 'immutable';


import { CodeSpan, Line } from "./editor-block";
import { parseHTML } from "./htmlParser";
import { PrismToken } from "./constant";

import "draft-js/dist/Draft.css";
import "./custom-editor.css";

const tabCharacter = "    ";

const getEntityStrategy = () => {
	return function(contentBlock, callback, contentState) {
		contentBlock.findEntityRanges((character) => {
			const entityKey = character.getEntity();
			if (entityKey === null) {
				return false;
			}
			return contentState.getEntity(entityKey).getType() === PrismToken;
		}, callback);
	};
}

const Editor = () => {
    const compositeDecorator = new CompositeDecorator([
        {
            strategy: getEntityStrategy(),
            component: CodeSpan
        }
    ]);

    const [editorState, setEditorState] = React.useState(() =>
        EditorState.createEmpty(compositeDecorator)
    );

    const blockRenderer = () => {
        return {
            component: Line,
        };
    };

    const onTab = (e) => {
        if(e.keyCode === 9) {
            e.preventDefault();
            let currentState = editorState;

            const currentContent = currentState.getCurrentContent()
            currentContent.createEntity("TAB", "MUTABLE", {});

            const entityKey = currentContent.getLastCreatedEntityKey();

            let newContentState = Modifier.insertText(
                currentContent,
                currentState.getSelection(),
                tabCharacter,
                Immutable.OrderedSet(["TAB"]),
                entityKey
            )
            setEditorState(EditorState.push(currentState, newContentState, 'insert-tab'))
            return null
        }
        // ...
        return getDefaultKeyBinding(e);
    }

    useEffect(() => {
        Prism.manual = true;
        Prism.highlightAll();
    }, [])

    const onChange = (newState) => {
        let currentState = newState.getCurrentContent()
        let newCurrentState = null;
        let blocks = currentState.getBlockMap()
        blocks.forEach((block, idx) => {
            let characterMetadataList = block.getCharacterList()
            const text = block.getText()
            if(text){
                const html = Prism.highlight(text, Prism.languages.python, 'python')
                const entityMap = parseHTML(html, text)
                entityMap.forEach(({start, end, classList}) => {
                    for (let index = start; index < end; index++) {
                        currentState = currentState.createEntity(
                            PrismToken,
                            'MUTABLE',
                            {classList}
                        )
                        const characterMetadata = characterMetadataList.get(index)
                        characterMetadataList = characterMetadataList.set(index, CharacterMetadata.applyEntity(characterMetadata, currentState.getLastCreatedEntityKey()))
                    }
                })
                block = block.set("characterList", characterMetadataList)
            }
            blocks = blocks.set(idx, block)
            newCurrentState = currentState.set("blockMap", blocks)
        })
        if(newCurrentState) {
            let newEditorState = EditorState.push(editorState, newCurrentState, "code-highlighting")
            newEditorState = EditorState.forceSelection(newEditorState, newState.getSelection())
            setEditorState(newEditorState)
        }else {
            setEditorState(newState)
        }
    }

    return (
        <DraftEditor
            placeholder="# You can start writing code"
            editorState={editorState}
            onChange={onChange}
            blockRendererFn={blockRenderer}
            keyBindingFn={onTab}
        />
    );
};

export default Editor;
