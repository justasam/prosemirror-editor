import { redo, undo } from "prosemirror-history";
import { Schema } from "prosemirror-model";
import { liftListItem, sinkListItem, splitListItem } from "prosemirror-schema-list";
import { Command } from "prosemirror-state";

export const buildKeymap = (schema: Schema) => {
    const keys: Record<string, Command> = {};

    keys["Mod-z"] = undo
    keys["Mod-y"] = redo

    if (schema.nodes.list_item) {
        keys["Enter"] = splitListItem(schema.nodes.list_item);
        keys["Tab"] = sinkListItem(schema.nodes.list_item);
        keys["Shift-Tab"] = liftListItem(schema.nodes.list_item);
    }

    return keys;
}