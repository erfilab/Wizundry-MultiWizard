import {Editor} from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import BubbleMenu from '@tiptap/extension-bubble-menu'
// import History from "@tiptap/extension-history";
import {Note} from "./note.js";

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
        Highlight.configure({multicolor: true}),
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
        HardBreak,
        BubbleMenu.configure({
          element: document.querySelector('.menu'),
        }),
        Note
      ],
    });
  } else {
    editor = new Editor({
      extensions: [
        StarterKit.configure({
          history: true,
        }),
        Highlight.configure({multicolor: true}),
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
        Placeholder.configure({
          placeholder: 'Speak something …',
          // Use different placeholders depending on the node type:
          // placeholder: ({ node }) => {
          //   if (node.type.name === 'heading') {
          //     return 'What’s the title?'
          //   }

          //   return 'Can you add some further context?'
          // },
        }),
        Note
      ],
    });
  }
  return editor;
};
