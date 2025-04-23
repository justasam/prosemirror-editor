import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic'; // Example schema
import { addListNodes } from 'prosemirror-schema-list';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { createContext, useCallback, useMemo, useState } from 'react';

export type EditorContextProps = {
    schema: Schema;
    editorState: EditorState | null;
    editorView: EditorView | null;
    dispatch: EditorView['dispatch'] | null;
    focus: EditorView['focus'] | null;
    handleEditorReady: (view: EditorView) => void;
    handleStateChange: (newState: EditorState) => void;
    isReady: boolean;
}

export const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [editorState, setEditorState] = useState<EditorState | null>(null);
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    const isReady = !!editorView && !!editorState;

    const handleEditorReady = useCallback((view: EditorView) => {
        setEditorView(view);
        setEditorState(view.state);
    }, []);

    const handleStateChange = useCallback((newState: EditorState) => {
        setEditorState(newState);
    }, []);

    const schema = useMemo(() => {
        return new Schema({
            nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
            marks: basicSchema.spec.marks,
        })
    }, []);

    const contextValue = useMemo<EditorContextProps>(() => ({
        schema,
        editorState,
        editorView,
        dispatch: editorView ? editorView.dispatch : null,
        focus: editorView ? () => editorView.focus() : null,
        isReady,
        handleEditorReady,
        handleStateChange
    }), [editorState, editorView, isReady, handleEditorReady, handleStateChange, schema]);

    return (
        <EditorContext.Provider value={contextValue}>
            {children}
        </EditorContext.Provider>
    );
};
