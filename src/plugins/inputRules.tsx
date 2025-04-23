import { inputRules, wrappingInputRule } from "prosemirror-inputrules";
import { Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";

export const listInputRules = (schema: Schema): Plugin => {
    const listItemType = schema.nodes.list_item;
    const bulletListType = schema.nodes.bullet_list;
    const orderedListType = schema.nodes.ordered_list;

    if (!listItemType || !bulletListType || !orderedListType) {
        console.error("List item, ordered list or bullet list type is not defined in the schema.");
        return new Plugin({});
    }

    const bulletListRule = wrappingInputRule(
        /^\s*([-*+])\s$/,
        bulletListType,
    )

    const orderedListRule = wrappingInputRule(
        /^(\d+)\.\s$/,
        orderedListType,
        match => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order == +match[1]
    )

    const rules = [
        bulletListRule,
        orderedListRule,
    ]

    return inputRules({ rules })
}