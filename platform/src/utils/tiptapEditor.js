import { Editor } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
// import History from "@tiptap/extension-history";
import HardBreak from '@tiptap/extension-hard-break'
import store from "../store";

export const initEditor = (collab, ydoc, yDocProvider, user) => {
    let editor = null;
    if (collab) {
        editor = new Editor({
            extensions: [
                StarterKit.configure({
                    history: false,
                }),
                Highlight,
                TaskList,
                TaskItem,
                Collaboration.configure({
                    document: ydoc,
                }),
                CollaborationCursor.configure({
                    provider: yDocProvider,
                    user: user,
                    onUpdate: (users) => {
                        store.commit("SET_CONNECTED_USER", users);
                    },
                }),
                CharacterCount.configure({
                    limit: 10000,
                }),
                HardBreak
            ],
        });
    } else {
        editor = new Editor({
            extensions: [
                StarterKit.configure({
                    history: true,
                }),
                Highlight,
                TaskList,
                History,
                TaskItem,
                Collaboration.configure({
                    document: ydoc,
                }),
                CharacterCount.configure({
                    limit: 10000,
                }),
                HardBreak,
            ],
        });
    }
    return editor;
};