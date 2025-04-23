import { MarkType } from "prosemirror-model";
import { EditorState } from "prosemirror-state";

export const isMarkActive = (state: EditorState, type: MarkType): boolean => {
    const { from, $from, to, empty } = state.selection;

    if (empty) {
        return !!type.isInSet(state.storedMarks || $from.marks());
    }

    let active = false;
    state.doc.nodesBetween(from, to, node => {
        if (node.isText && type.isInSet(node.marks)) {
            active = true;
        }
    });

    return active;
}