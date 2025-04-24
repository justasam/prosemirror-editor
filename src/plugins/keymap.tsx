import { chainCommands } from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";
import { Schema } from "prosemirror-model";
import { liftListItem, sinkListItem, splitListItem } from "prosemirror-schema-list";
import { Command } from "prosemirror-state";
import { clearAutocompleteText, insertAutocompleteText } from "../commands/autoComplete";

export const buildKeymap = (schema: Schema) => {
    const keys: Record<string, Command> = {};

    keys["Mod-z"] = undo
    keys["Mod-y"] = redo

    const tabCommands = [
        insertAutocompleteText
    ]

    keys["ArrowRight"] = insertAutocompleteText;
    keys["Escape"] = clearAutocompleteText;

    if (schema.nodes.list_item) {
        keys["Enter"] = splitListItem(schema.nodes.list_item);
        tabCommands.push(sinkListItem(schema.nodes.list_item));
        keys["Shift-Tab"] = liftListItem(schema.nodes.list_item);
    }

    keys["Tab"] = chainCommands(...tabCommands);

    return keys;
}