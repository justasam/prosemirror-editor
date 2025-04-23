import { BoldIcon, CodeIcon, ItalicIcon, LinkIcon, ListIcon, ListMinusIcon, ListOrderedIcon, ListPlusIcon, RedoIcon, UndoIcon } from 'lucide-react';
import { toggleMark } from 'prosemirror-commands';
import { redo, redoDepth, undo, undoDepth } from 'prosemirror-history';
import { Command } from "prosemirror-state";
import { ReactNode } from 'react';

import { liftListItem, sinkListItem, wrapInList } from 'prosemirror-schema-list';
import { useEditor } from "../hooks/useEditor";
import { isMarkActive } from '../utils/marks';
import { isNodeActive } from '../utils/nodes';

type MenuButtonProps = {
    icon?: ReactNode;
    title?: string;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
}

const MARK_ICON_MAP = {
    strong: BoldIcon,
    em: ItalicIcon,
    link: LinkIcon,
    code: CodeIcon
};

const MenuButton = ({ icon, title, onClick, disabled, active }: MenuButtonProps) => {
    return (
        <button onClick={onClick} onMouseDown={(e) => e.preventDefault()} className={`menu-item ${active ? 'active' : ''}`} disabled={disabled}>
            {icon ? icon : null}
            {title ? <span>{title}</span> : null}
        </button>
    )
}

const ProseMirrorEditorMenu = () => {
    const { editorState, dispatch, schema } = useEditor();

    if (!editorState || !dispatch) {
        console.error("Editor state or dispatch function is not available.");
        return null;
    }

    const dispatchCommand = (command: Command) => {
        if (!editorState || !dispatch) {
            console.error("Editor state or dispatch function is not available.");
            return;
        }

        command(editorState, dispatch);
    }

    const testCommand = (command: Command) => {
        if (!editorState || !dispatch) {
            console.error("Editor state or dispatch function is not available.");
            return;
        }

        return command(editorState, undefined);
    }

    const renderMarks = () => Object.entries(MARK_ICON_MAP).map(([markName, Icon]) => {
        const markType = schema.marks[markName];
        if (!markType) return null;

        return <MenuButton
            key={markName}
            icon={<Icon size={16} />}
            onClick={() => dispatchCommand(toggleMark(markType))}
            active={isMarkActive(editorState, markType)}
        />
    });

    const renderBulletListButton = () => {
        if (!schema.nodes.bullet_list || !schema.nodes.list_item) return null;

        if (isNodeActive(editorState, schema.nodes.bullet_list) || isNodeActive(editorState, schema.nodes.ordered_list)) {
            return <>
                <MenuButton
                    icon={<ListMinusIcon size={16} />}
                    onClick={() => dispatchCommand(liftListItem(schema.nodes.list_item))}
                />
                <MenuButton
                    icon={<ListPlusIcon size={16} />}
                    onClick={() => dispatchCommand(sinkListItem(schema.nodes.list_item))}
                    disabled={!testCommand(sinkListItem(schema.nodes.list_item))}
                />
            </>
        }

        return <>
            <MenuButton
                icon={<ListIcon size={16} />}
                onClick={() => dispatchCommand(wrapInList(schema.nodes.bullet_list))}
            />
            <MenuButton
                icon={<ListOrderedIcon size={16} />}
                onClick={() => dispatchCommand(wrapInList(schema.nodes.ordered_list))}
            />
        </>
    }

    return <section className="editor-menu">
        <div className="sub-menu marks-menu glass-effect">
            {renderMarks()}
        </div>
        <div className="sub-menu li-menu glass-effect">
            {renderBulletListButton()}
        </div>
        <div className="sub-menu ur-menu glass-effect">
            <MenuButton
                icon={<UndoIcon size={16} />}
                onClick={() => dispatchCommand(undo)}
                disabled={undoDepth(editorState) === 0}
            />
            <MenuButton
                icon={<RedoIcon size={16} />}
                onClick={() => dispatchCommand(redo)}
                disabled={redoDepth(editorState) === 0}
            />
        </div>
    </section>
}

export default ProseMirrorEditorMenu;