import { debounce } from "lodash";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { commonWords } from "../data/words";

export const autoCompletePluginKey = new PluginKey("autoCompletePlugin");

const getAutocomplete = async (word: string): Promise<string | null> => {
    const suggestions = commonWords;

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(
                suggestions.find((suggestion) => suggestion.startsWith(word) && suggestion.length > word.length)?.slice(word.length) || null
            );
        }, 100);
    });
}

const debouncedAutocomplete = debounce(getAutocomplete, 300, {
    leading: true,
});


export const autoCompletePlugin = new Plugin<{
    autocomplete: string | null;
}>({
    key: autoCompletePluginKey,
    view() {
        return {
            update: (view, prevState) => {
                if (prevState.doc.textContent === view.state.doc.textContent && prevState.selection.$from === view.state.selection.$from) return;

                if (!view.state.selection.empty) return

                const { $from } = view.state.selection;
                const words = $from.nodeBefore?.text ?? "";
                const wordsAfter = $from.nodeAfter?.text ?? "";
                const newWord = words.split(" ").pop() || "";

                debouncedAutocomplete.cancel();

                view.dispatch(view.state.tr.setMeta(autoCompletePluginKey, { autocomplete: null }));

                if (newWord.length < 3 || !!wordsAfter.split(" ")[0]?.length) {
                    return
                }


                debouncedAutocomplete(newWord)?.then((autocomplete) => {
                    if (autocomplete) {
                        view.dispatch(
                            view.state.tr.setMeta(autoCompletePluginKey, { autocomplete })
                        );
                    }
                }).catch((error) => {
                    console.error("Error fetching autocomplete:", error);
                });
            }
        }
    },
    state: {
        init() {
            return { autocomplete: null };
        },
        apply(tr, pluginState) {
            const meta = tr.getMeta(autoCompletePluginKey);

            if (meta && meta.autocomplete !== undefined) {
                return { autocomplete: meta.autocomplete };
            }

            return {
                autocomplete: pluginState.autocomplete,
            };
        }
    },
    props: {
        decorations(state) {
            const { autocomplete }: { autocomplete: string | null } = autoCompletePluginKey.getState(state);

            if (!autocomplete) {
                return null;
            }

            const placeholderNode = document.createElement("span")
            placeholderNode.className = "autocompletion-text"
            placeholderNode.textContent = autocomplete

            return DecorationSet.create(state.doc, [
                Decoration.widget(state.selection.to, placeholderNode, {
                    ignoreSelection: true,
                })
            ])
        }
    }
})