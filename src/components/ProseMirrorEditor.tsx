import { baseKeymap } from "prosemirror-commands";
import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useEffect, useRef } from "react";

import { useEditor } from "../hooks/useEditor";
import { listInputRules } from "../plugins/inputRules";
import { buildKeymap } from "../plugins/keymap";
import { persistentSelectionPlugin } from "../plugins/persistentSelection";
import { placeholderPlugin } from "../plugins/placeholder";

const ProseMirrorEditor = () => {
    const editorRef = useRef<EditorView | null>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    const { schema, handleEditorReady, handleStateChange } = useEditor();

    useEffect(() => {
        if (editorRef.current || !editorContainerRef.current) return;

        const state = EditorState.create({
            schema,
            plugins: [
                placeholderPlugin("Type something..."),
                listInputRules(schema),
                history(),
                keymap(buildKeymap(schema)),
                keymap(baseKeymap),
                persistentSelectionPlugin,
            ],
        })

        const view = new EditorView(editorContainerRef.current, {
            state,
            dispatchTransaction(transaction) {
                const newState = view.state.apply(transaction)
                view.updateState(newState)
                handleStateChange(newState);
            },
            handleDOMEvents: {
                mousedown: (view, event) => {
                    if (view.hasFocus() || view.state.selection.empty) return false;
                    const posInfo = view.posAtCoords({ left: event.clientX, top: event.clientY });

                    if (!posInfo) return false;

                    const tr = view.state.tr;
                    const newSelection = posInfo.inside === -1 ? TextSelection.near(view.state.doc.resolve(posInfo.pos)) : TextSelection.create(view.state.doc, posInfo.pos);

                    tr.setSelection(newSelection);
                    tr.setMeta('preventScroll', true);
                    view.dispatch(tr);

                    return false;
                }
            }
        });

        editorRef.current = view;
        handleEditorReady(view);

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        }
    }, [schema, handleEditorReady, handleStateChange]);

    return <div ref={editorContainerRef} className="prosemirror-editor-container" />;
}

export default ProseMirrorEditor;