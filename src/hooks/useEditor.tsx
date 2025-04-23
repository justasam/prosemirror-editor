import { useContext } from "react";
import { EditorContext, EditorContextProps } from "../context/EditorContext";

export const useEditor = (): EditorContextProps => {
    const context = useContext(EditorContext);

    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }

    return context;
};