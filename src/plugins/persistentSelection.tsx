import { Plugin, PluginKey, Selection, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const selectionPluginKey = new PluginKey("persistentSelection");

export const persistentSelectionPlugin = new Plugin<{
    lastSelection: Selection | null;
    focused: boolean;
}>({
    key: selectionPluginKey,
    state: {
        init() {
            return {
                lastSelection: null,
                focused: false,
            };
        },
        apply(tr, value, _, newState) {
            const focused = tr.getMeta('focus') !== undefined ? tr.getMeta('focus') : value.focused
            const focusChanged = focused !== value.focused

            if (focused) {
                return {
                    lastSelection: null,
                    focused: true,
                }
            }

            if (focusChanged) {
                return {
                    lastSelection: newState.selection,
                    focused: false,
                }
            }

            // if document changed, the selection might need to be remapped:
            if (tr.docChanged && value.lastSelection) {
                const mappedAnchor = tr.mapping.map(value.lastSelection.anchor);
                const mappedHead = tr.mapping.map(value.lastSelection.head);

                const anchorResult = tr.mapping.mapResult(value.lastSelection.anchor);
                const headResult = tr.mapping.mapResult(value.lastSelection.head);

                if (!anchorResult.deleted || !headResult.deleted) {
                    return {
                        lastSelection: TextSelection.create(newState.doc, mappedAnchor, mappedHead),
                        focused: false,
                    }
                }
            }

            return {
                lastSelection: null,
                focused: false,
            }
        },
    },
    props: {
        decorations(state) {
            const { lastSelection } = selectionPluginKey.getState(state);
            if (!lastSelection || lastSelection.empty) return null;

            const { from, to } = lastSelection;

            return DecorationSet.create(state.doc, [
                Decoration.inline(from, to, {
                    class: "persistent-selection",
                }),
            ]);
        },
        handleDOMEvents: {
            blur(view) {
                view.dispatch(view.state.tr.setMeta('focus', false))
                return false
            },
            focus(view) {
                view.dispatch(view.state.tr.setMeta('focus', true))
                return false
            }
        },
    },
})