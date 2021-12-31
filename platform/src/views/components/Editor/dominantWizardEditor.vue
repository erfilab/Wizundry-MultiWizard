<template>
  <div class="ma-3">
    <v-row>
      <v-col cols="4">
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <v-list>
                <v-list-group
                  :value="true"
                  no-action
                >
                  <template v-slot:activator>
                    <v-list-item-title>Participants</v-list-item-title>
                  </template>
                  <v-list-item
                    v-for="([color, content], i) in participantsLabel"
                    :key="i"
                    link
                  >
                    <v-btn
                      :color="color"
                      small
                      class="mr-2"
                      @click="addLabel(color, content)"
                    >
                      {{ content }}
                    </v-btn>
                  </v-list-item>
                </v-list-group>
              </v-list>
              <v-list>
                <v-list-group
                  no-action
                  :value="true"
                >
                  <template v-slot:activator>
                    <v-list-item-title>Content</v-list-item-title>
                  </template>

                  <v-list-item
                    v-for="([color, content], i) in contentLabel"
                    :key="i"
                    link
                  >
                    <v-btn
                      :color="color"
                      small
                      class="mr-2"
                      @click="addLabel(color, content)"
                    >
                      {{ content }}
                    </v-btn>
                  </v-list-item>
                </v-list-group>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card
            v-for="item in voiceBoxes"
            :key="item.id"
            :color="item.color"
          >
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <v-text-field
                  v-model="item.content"
                  class="mt-3 ml-3"
                  @keyup.enter="item.status ? emitSpeakerEvent({type: 'VOICE_BOX', ...item, status: false}) : emitSpeakerEvent({type: 'VOICE_BOX', ...item, status: true})"
                />
              </div>
              <v-btn
                text
                x-small
                style="top: 10%; position: absolute; right: 0;"
                @click="item.status ? emitSpeakerEvent({type: 'VOICE_BOX', ...item, status: false}) : emitSpeakerEvent({type: 'VOICE_BOX', ...item, status: true})"
              >
                <v-icon>
                  {{ item.status ? "mdi-pause" : "mdi-play" }}
                </v-icon>
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-col>
      <v-col cols="8">
        <v-row>
          <v-card
            max-width="100%"
            tile
          >
            <hooper
              ref="verticalNotesList"
              :items-to-show="3.5"
              :center-mode="true"
              style="width: 130vh"
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
        </v-row>
        <v-row>
          <v-col cols="3">
            <v-btn
              text
              :color="!isRecording ? 'grey' : 'cyan'"
              @click="isRecording ? emitMicrophoneEvent(false) : emitMicrophoneEvent(true)"
            >
              {{ isRecording ? "speaking..." : "closed" }}
              <v-icon>
                {{ !isRecording ? "mdi-microphone-off" : "mdi-microphone" }}
              </v-icon>
            </v-btn>
          </v-col>
          <v-col class="pt-5 mt-2">
            <v-progress-linear
              :color="!isRecording ? 'cyan' : 'cyan darken-3'"
              :indeterminate="isRecording"
            />
          </v-col>
        </v-row>
        <div
          v-if="editor"
          class="editor"
          @keydown.esc="isSpeaking ? emitSpeakerEvent({type: 'CONTENT_REVIEW', status: false}) : emitSpeakerEvent({type: 'CONTENT_REVIEW', status: true})"
        >
          <menu-bar
            class="editor__header"
            :editor="editor"
          />
          <bubble-menu
            v-if="editor"
            :editor="editor"
          >
            <v-btn-toggle
              dense
              background-color="#b8b4b4"
            >
              <v-btn
                small
                :class="{'is-active': editor.isActive('bold')}"
                @click="editor.chain().focus().toggleBold().run()"
              >
                <v-icon>mdi-format-bold</v-icon>
              </v-btn>
              <v-btn
                small
                :class="{'is-active': editor.isActive('italic')}"
                @click="editor.chain().focus().toggleItalic().run()"
              >
                <v-icon>mdi-format-italic</v-icon>
              </v-btn>
              <v-btn
                small
                :class="{'is-active': editor.isActive('strike')}"
                @click="editor.chain().focus().toggleStrike().run()"
              >
                <v-icon>mdi-format-strikethrough-variant</v-icon>
              </v-btn>
              <v-btn
                small
                :class="{'is-active': editor.isActive('highlight')}"
                @click="editor.chain().focus().toggleHighlight().run()"
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
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {EditorContent, BubbleMenu} from "@tiptap/vue-2";
import {initSocket} from "../../../utils/webSocket";
import {initYDoc} from "../../../utils/yDoc";
import {initEditor} from "../../../utils/tiptapEditor";
import MenuBar from "./MenuBar";
import {mapGetters} from 'vuex';
import {Hooper, Slide} from 'hooper';
// import 'hooper/dist/hooper.css';

let socket;

export default {
  name: "DominantWizardEditor",
  components: {
    EditorContent,
    MenuBar,
    BubbleMenu,
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

      //web speech
      isRecording: false,


      // speaker
      isSpeaking: false,
      itemTalking: -1,
      itemStyle: 1,
      lastSpeakerWizard: "",
      lastSpeakerType: "",

      // voiceBoxes
      voiceBoxes: [
        {
          id: 1,
          color: "#f0f0f0",
          content: "",
          status: false,
        },
        {
          id: 2,
          color: "#CDE589",
          content: "Please speak slower!",
          status: false,
        }
      ],

      runTimeContent: "",
      newContent: "",
      contentAnchor: 0,

      // labels
      participantsLabel: [
        ['#c9781c', 'user1'],
        ['#94FADB', 'user2'],
        ['#958DF1', 'user3'],
      ],
      contentLabel: [
        ['#F98181', 'Key'],
        ['#70CFF8', 'Relevant'],
        ['#b8b4b4', 'Irrelevant'],
      ],

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
    document.removeEventListener('keydown', this._keyListener)
  },
  async mounted() {
    socket = await initSocket(this.nowDay);

    socket
      .on("WEB_RECORDING", async (e) => {
        console.log("WEB RECORDING STATUS: ", e)
        this.isRecording = e
      })
      .on("WEB_SPEAKER", async e => {
        console.log("WEB_SPEAKER", e)
        if (e.type === 'VOICE_BOX') {
          this.voiceBoxes.map(vb => {
            if (vb.id === e.id) {
              vb.status = e.status
            }
          })
        } else if (e.type === 'CONTENT_REVIEW') {
          this.isSpeaking = e.status
        } else {
          this.isSpeaking = e.status
          this.voiceBoxes.map(vb => {
            vb.status = false
            if (vb.color === '#f0f0f0') vb.content = ""
          })
        }
      })
      .on("NOTE_ADDED", async (e) => {
        console.log("Note Added: ", e.note.content)
        this.notesList.push(e)
      })
      .on("NOTE_REMOVED", async (uuid) => {
        console.log("Note Removed: ", uuid)
        this.notesList = this.notesList.filter(note => note.uuid !== uuid)
      });

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

    this.editor.chain().focus().user(currentUser).run();
    this._keyListener = function (e) {
      if (e.key === "q" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.emitMicrophoneEvent(!this.isRecording);
      } else if (e.key === "e" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
      }
    };

    this.editor.on("selectionUpdate", ({editor, event}) => {
      if (editor.state.selection.content().size > 0) {
        this.setCurrentSelectedNote(editor)
      }
    })
    setTimeout(this.findCommentsAndStoreValues, 500)

    document.addEventListener('keydown', this._keyListener.bind(this));
  },
  methods: {
    // utils
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

    // mic record
    emitMicrophoneEvent(e) {
      socket.emit("MICROPHONE", {
        trialName: this.trialInfo.trialName,
        userId: this.userInfo.userId,
        status: e,
      })
    },
    // speaker event
    emitSpeakerEvent(event) {
      // voice box speaker
      if (event.type === 'VOICE_BOX') {
        socket.emit("SPEAKER", {
          type: 'VOICE_BOX',
          userId: this.userInfo.userId,
          trialName: this.trialInfo.trialName,
          ...event
        });
      }
      // content review speaker
      else {
        let selectedText = "";
        if (event.status) {
          const {size} = this.editor.view.state.doc.content;
          selectedText = this.editor.state.doc.textBetween(
            this.editor.state.selection.anchor,
            size,
            " "
          );
        }
        socket.emit("SPEAKER", {
          type: "CONTENT_REVIEW",
          trialName: this.trialInfo.trialName,
          userId: this.userInfo.userId,
          status: event.status,
          content: selectedText,
        });
      }
    },

    // label
    addLabel(color, labelName) {
      const {from, to, $from, $to} = this.editor.view.state.selection
      // const fromIndex = $from.posAtIndex()
      // const toIndex = $to.posAtIndex()
      let nodes = []
      let removeList = [...(this.participantsLabel.map(p => p[1])), ...(this.contentLabel.map(c => c[1])), '💬']

      let tempText = ""
      this.editor.state.doc.nodesBetween(from, to, (node, pos) => {
        let {type: {name}, text, nodeSize, marks} = node
        if (text) {
          text = text.trim()
          if (name === 'text' && !removeList.includes(text) && !text.includes('💬')) {
            console.log(color, labelName, name, text)

            if (nodes.length && marks.length && marks[0].type.name === 'highlight') {
              tempText = text
            } else if (!marks.length) {
              if (!tempText.length) nodes.push([color, labelName, pos, text + ' ', nodeSize])
              tempText = ''
            }
          }
        }
      })

      for (let i = nodes.length - 1; i >= 0; i--) {
        const [color, labelName, pos, content, nodeSize] = nodes[i]

        socket.emit('ADD_LABEL', {
          trialName: this.trialInfo.trialName,
          userId: this.userInfo.userId,
          labelColor: color,
          labelName: labelName,
          labelPosition: pos,
          content: content
        })
        this.editor
          .chain()
          .focus(pos)
          .command(({editor, tr}) => {
            tr.delete(pos, pos + nodeSize);
            return true;
          })
          .insertContent(`<mark style="background-color: ${color}"> ${labelName} </mark> ${content}`)
          .run();
      }
    },

    // note
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
        this.noteContent = parsedNote.note.content
        this.currentSelectedNote = parsedNote
        this.$refs.verticalNotesList.slideTo(
          this.notesList.map(n => n.uuid).indexOf(parsedNote.uuid)
        );
      } else {
        this.currentSelectedNote = {}
        this.noteContent = ""
      }
    },
  },
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
.hooper-slide {
  width: auto;
}

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
