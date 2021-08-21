<template>
  <div>
    <div class="editor">
      <editor-content
        class="editor__content"
        :editor="editor"
      />
    </div>
    <v-btn
      class="float-right mt-2 mr-2"
      elevation="2"
      color="#7CB342"
      @click="send()"
    >
      Send
    </v-btn>
  </div>
</template>

<script>
import {Editor, EditorContent} from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";

import * as Y from "yjs";
import {WebsocketProvider} from "y-websocket";
import {IndexeddbPersistence} from "y-indexeddb";

export default {
  name: "TextEditor",
  components: {
    EditorContent,
  },
  props: {
    currentUser: Object,
    timeLineItem: Object,
    timeLineContent: String,
  },
  watch: {
    currentUser(newUser)  {
      if (newUser) this.initEditor();
    }
  },
  data() {
    return {
      provider: null,
      indexdb: null,
      editor: null,
      users: [],
      status: "connecting",
    }
  },
  methods: {
    send() {
      this.$emit('sent', this.editor.state.doc.textContent)
    },
    initEditor() {
      console.log('currentUser', this.currentUser)
      const ydoc = new Y.Doc();

      let YJS_HOST =
          process.env.NODE_ENV === "production"
              ? "wss://ryanyen2.tech/yjs/"
              : "ws://localhost:3001";
      this.provider = new WebsocketProvider(
          YJS_HOST,
          new Date().toISOString().slice(0, 10),
          ydoc
      );
      this.provider.on("status", (event) => (this.status = event.status));
      window.ydoc = ydoc;
      this.indexdb = new IndexeddbPersistence(
          new Date().toISOString().slice(0, 10),
          ydoc
      );

      this.editor = new Editor({
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
            provider: this.provider,
            user: this.currentUser.name,
            onUpdate: (users) => {
              this.users = users;
            },
          }),
          CharacterCount.configure({
            limit: 10000,
          }),
        ],
      });
      this.editor.chain().focus().user(this.currentUser).run();
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    },
  },
  mounted() {
    console.log('mounted', this.currentUser)
    if(this.currentUser) this.initEditor();
  }
}
</script>

<style scoped>

.editor {
  display: flex;
  flex-direction: column;
  min-height: 100px;
  /*width: 100px;*/
  color: #0d0d0d;
  background-color: white;
  border: 3px solid #0d0d0d;
  border-radius: 0.75rem;
  /* Some information about the status */
}

.editor__header {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  flex-wrap: wrap;
  padding: 0.25rem;
  border-bottom: 3px solid #0d0d0d;
}

.editor__content {
  padding: 1.25rem 1rem;
  font-family: monospace;
  font-size: 18px;
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.editor__footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  white-space: nowrap;
  border-top: 3px solid #0d0d0d;
  font-size: 12px;
  font-weight: 600;
  color: #0d0d0d;
  padding: 0.25rem 0.75rem;
}

.editor__status {
  display: flex;
  align-items: center;
  border-radius: 5px;
}

.editor__status::before {
  content: " ";
  flex: 0 0 auto;
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background: rgba(13, 13, 13, 0.5);
  border-radius: 50%;
  margin-right: 0.5rem;
}

.editor__status--connecting::before {
  background: #616161;
}

.editor__status--connected::before {
  background: #b9f18d;
}

.editor__name button {
  background: none;
  border: none;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #0d0d0d;
  border-radius: 0.4rem;
  padding: 0.25rem 0.5rem;
}

.editor__name button:hover {
  color: #fff;
  background-color: #0d0d0d;
}
</style>

<style>
.collaboration-cursor__caret {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  color: #0d0d0d;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
}

.ProseMirror ul,
.ProseMirror ol {
  padding: 0 1rem;
}

.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3,
.ProseMirror h4,
.ProseMirror h5,
.ProseMirror h6 {
  line-height: 1.1;
}

.ProseMirror code {
  background-color: rgba(97, 97, 97, 0.1);
  color: #616161;
}

.ProseMirror pre {
  background: #0d0d0d;
  color: #fff;
  font-family: "JetBrainsMono", monospace;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.ProseMirror pre code {
  color: inherit;
  padding: 0;
  background: none;
  font-size: 0.8rem;
}

.ProseMirror mark {
  background-color: #faf594;
}

.ProseMirror img {
  max-width: 100%;
  height: auto;
}

.ProseMirror hr {
  margin: 1rem 0;
}

.ProseMirror blockquote {
  padding-left: 1rem;
  border-left: 2px solid rgba(13, 13, 13, 0.1);
}

.ProseMirror hr {
  border: none;
  border-top: 2px solid rgba(13, 13, 13, 0.1);
  margin: 2rem 0;
}

.ProseMirror ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}

.ProseMirror ul[data-type="taskList"] li {
  display: flex;
  align-items: center;
}

.ProseMirror ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  margin-right: 0.5rem;
}
</style>
