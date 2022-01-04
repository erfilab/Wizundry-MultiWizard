<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <div
          v-if="editor"
          class="editor"
        >
          <menu-bar
            class="editor__header"
            :editor="editor"
          />
          <bubble-menu
            :tippy-options="{duration: 100, placement: 'bottom'}"
            :editor="editor"
          >
            <v-btn-toggle
              dense
              background-color="#b8b4b4"
            >
              <v-btn
                small
                :class="{'is-active': editor.isActive('highlight')}"
                @click="highlightText"
              >
                <v-icon>mdi-format-color-fill</v-icon>
              </v-btn>
              <v-btn
                small
                @click="openNoteEditor = !openNoteEditor"
              >
                <v-icon>mdi-comment-edit</v-icon>
              </v-btn>
              <v-btn
                small
                @click="clearNote(null)"
              >
                <v-icon>mdi-comment-remove-outline</v-icon>
              </v-btn>
            </v-btn-toggle>
            <v-dialog v-model="openNoteEditor" width="400">
              <v-card>
                <v-card-text>
                  <v-textarea
                    v-model="noteContent"
                    placeholder="Add note..."
                    class="border-none outline-none"
                    @keypress.enter.stop.prevent="addNote"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-btn-toggle
                    dense
                    background-color="#b8b4b4"
                  >
                    <v-btn
                      small
                      color="warning"
                      @click="() => (noteContent = '', openNoteEditor = false)"
                    >
                      Clear
                    </v-btn>
                    <v-btn
                      small
                      @click="addNote"
                    >
                      Add
                    </v-btn>
                  </v-btn-toggle>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </bubble-menu>
          <div ref="target">
            <editor-content
              class="editor__content"
              :editor="editor"
            />
            <div class="editor__footer">
              <div :class="`editor__status editor__status--${connectStatus}`">
                <template v-if="connectStatus === 'connected'">
                  {{ connectedUsers.length }} user{{
                    connectedUsers.length === 1 ? "" : "s"
                  }}
                  online in
                  {{ trialInfo.trialName }}
                </template>
                <template v-else>
                  offline
                </template>
              </div>
              <div class="editor__name">
                <button>
                  {{ userInfo.username }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </v-col>
      <v-col cols="4">
        <v-card
          max-width="100%"
          tile
        >
          <hooper
            ref="verticalNotesList"
            :vertical="true"
            style="height: 550px"
            :items-to-show="4.5"
            :center-mode="true"
          >
            <slide
              v-for="note in notesList"
              :key="note.uuid"
              :index="note.uuid"
            >
              <v-card
                style="width: 90%"
                :class="{'currentNote': note.uuid === currentSelectedNote.uuid}"
              >
                <v-card-title>
                  {{ note.note.content }}
                  <v-btn
                    icon
                    @click.end="clearNote(note)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <p>Name : {{ note.note.username }}</p>
                  <p>
                    Time : {{
                      new Date(note.note.time).toJSON().substring(0, 19).replace('T', ' ')
                    }}
                  </p>
                </v-card-text>
              </v-card>
            </slide>
          </hooper>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {EditorContent, BubbleMenu} from "@tiptap/vue-2";
import {initSocket} from "../../../utils/webSocket";
import {initYDoc} from "../../../utils/yDoc";
import {initEditor} from "../../../utils/tiptapEditor";
import {mapGetters} from 'vuex';
import MenuBar from "./MenuBar";
import {Hooper, Slide} from 'hooper';
import 'hooper/dist/hooper.css';

let socket;

export default {
  name: "NoteWizardEditor",
  components: {
    EditorContent,
    BubbleMenu,
    MenuBar,
    Hooper,
    Slide
  },
  props: {
    userInfo: {
      default: null,
      type: Object
    },
    trialInfo: {
      default: null,
      type: Object
    },
  },
  data() {
    return {
      nowDay: new Date().toISOString().slice(0, 10),

      //editor
      yDocProvider: null,
      editor: null,
      connectStatus: "connecting",

      // note
      noteContent: "",
      openNoteEditor: false,

      currentSelectedNote: {},
      notesList: [],
    }
  },
  computed: {
    ...mapGetters([
      "connectedUsers",
    ])
  },
  beforeDestroy() {
    this.editor.destroy();
    this.yDocProvider.destroy();
    document.removeEventListener('mouseup', this._mouseUpHandler.bind(this));
  },
  async mounted() {
    socket = await initSocket(this.nowDay);

    socket
      .on("NOTE_ADDED", async (e) => {
        console.log("Note Added: ", e.note.content)
        this.notesList.push(e)
      })
      .on("NOTE_REMOVED", async (uuid) => {
        console.log("Note Removed: ", uuid)
        this.notesList = this.notesList.filter(note => note.uuid !== uuid)
      })

    socket.emit("joinRoom", this.trialInfo.trialName);

    const [indexdb, ydoc, yDocProvider] = initYDoc(this.trialInfo.trialName);
    this.yDocProvider = yDocProvider;
    this.yDocProvider.on("status", (event) => (this.connectStatus = event.status));

    const currentUser = {
      name: this.userInfo.username,
      color: this.getRandomColor(),
    };

    this.editor = await initEditor(
      true,
      ydoc,
      this.yDocProvider,
      currentUser
    );

    this.editor.on("selectionUpdate", ({editor, event}) => {
      if (editor.state.selection.content().size > 0) {
        this.setCurrentSelectedNote(editor)
      }
    })
    setTimeout(this.findCommentsAndStoreValues, 500)

    this.editor.chain().focus().user(currentUser).run();
  },
  methods: {
    uuidv4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    getRandomColor() {
      const list = [
        "#958DF1",
        "#F98181",
        "#FBBC88",
        "#FAF594",
        "#70CFF8",
        "#94FADB",
        "#B9F18D",
      ];
      return list[Math.floor(Math.random() * list.length)];
    },
    findCommentsAndStoreValues() {
      const proseMirror = document.querySelector('.ProseMirror');
      const notes = proseMirror.querySelectorAll('span[data-note]');

      if (!notes) {
        this.notesList = [];
        return;
      }

      notes.forEach((node) => {
        const noteNodes = node.getAttribute('data-note');
        const jsonNotes = noteNodes ? JSON.parse(noteNodes) : null;
        this.notesList.push(jsonNotes)
      });
    },
    highlightText() {
      this.editor.chain().focus().toggleHighlight().run()
      this.noteContent = ""
      this.openNoteEditor = false
    },
    addNote() {
      if (!this.noteContent.trim().length) return;
      if (this.currentSelectedNote) {
        this.editor.chain().focus().unsetNote().run();
      }
      let newNote = {
        uuid: this.uuidv4(),
        trialName: this.trialInfo.trialName,
        userId: this.userInfo.userId,
        note: {
          username: this.userInfo.username,
          time: Date.now(),
          content: this.noteContent,
        },
      }

      const {to} = this.editor.view.state.selection
      // const toIndex = $to.posAtIndex()
      socket.emit('ADD_NOTE', {...newNote})

      this.editor.chain()
        .setNote(JSON.stringify(newNote))
        .focus(to)
        .insertContent('💬')
        .run();

      this.noteContent = ""
      this.openNoteEditor = false
    },
    clearNote(note) {
      if (note) this.currentSelectedNote = note
      this.noteContent = ""
      this.openNoteEditor = false

      socket.emit('REMOVE_NOTE', {...this.currentSelectedNote})

      const {to} = this.editor.view.state.selection
      this.editor.chain()
        .unsetNote()
        .focus(to)
        .command(({editor, tr}) => {
          tr.delete(to, to + 2);
          return true;
        })
        .run();

    },
    setCurrentSelectedNote(editor) {
      const note = editor.getAttributes('note').note
      if (note) {
        const parsedNote = JSON.parse(editor.getAttributes('note').note);
        // this.openNoteEditor = !editor.state.selection.empty;
        this.noteContent = parsedNote.note.content
        this.currentSelectedNote = parsedNote
        this.$refs.verticalNotesList.slideTo(
          this.notesList.map(n => n.uuid).indexOf(parsedNote.uuid)
        );
      } else {
        this.noteContent = ""
        // this.openNoteEditor = true
        // document.addEventListener('mouseup', this._mouseUpHandler);
        this.currentSelectedNote = {}
      }
    },
    _mouseUpHandler() {
      this.noteContent = ""
      this.openNoteEditor = true
      this.currentSelectedNote = {}
      document.removeEventListener('mouseup', this._mouseUpHandler);
    }
  }
}
</script>


<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  /*min-height: 550px;*/
  /*width: 680px;*/
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


<style lang="scss">
.currentNote {
  background-color: #88b957 !important;
  margin: 0 3px 2px 0;
  border-style: outset;
}

span[data-note] {
  background: #88b957;

  //&::after {
  //  content: "💬";
  //  user-select: all;
  //}
}
</style>
