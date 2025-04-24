import { Command } from "prosemirror-state";
import { autoCompletePluginKey } from "../plugins/autoComplete";

export const insertAutocompleteText: Command = (state, dispatch) => {
    const autocompleteText: string | null = autoCompletePluginKey.getState(state).autocomplete;

    if (!autocompleteText) return false;

    const { tr } = state;

    const { from } = state.selection;

    tr.insertText(autocompleteText, from);
    tr.setMeta(autoCompletePluginKey, { autocomplete: null });
    dispatch?.(tr);

    return true;
}

export const clearAutocompleteText: Command = (state, dispatch) => {
    const autocompleteText: string | null = autoCompletePluginKey.getState(state).autocomplete;

    if (!autocompleteText) return false;

    const { tr } = state;

    tr.setMeta(autoCompletePluginKey, { autocomplete: null });
    dispatch?.(tr);

    return true;
}