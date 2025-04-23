import { NodeType } from "prosemirror-model";
import { EditorState } from "prosemirror-state";

export const isNodeActive = (state: EditorState, nodeType: NodeType) => {
    const { $from } = state.selection;

    for (let i = $from.depth; i >= 0; i--) {
        const ancestorNode = $from.node(i);
        if (ancestorNode.type === nodeType) {
            return true;
        }
    }

    return false;
}