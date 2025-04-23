import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const placeholderPlugin = (placeholderText: string) => new Plugin({
    props: {
        decorations(state) {
            const { doc } = state;

            // return if the document is empty
            if (doc.childCount !== 1 || !doc.firstChild?.isTextblock || doc.firstChild.childCount > 0) {
                return null;
            }

            const placeholderNode = document.createElement("span")
            placeholderNode.className = "pm-placeholder"
            placeholderNode.textContent = placeholderText

            return DecorationSet.create(doc, [
                Decoration.widget(1, placeholderNode, {
                    ignoreSelection: true,
                })
            ])
        }
    }
})