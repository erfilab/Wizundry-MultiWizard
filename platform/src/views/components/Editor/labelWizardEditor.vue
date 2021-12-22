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
      <v-col cols="4">
        <v-card
          class="mx-auto"
          max-width="344"
          variant="outlined"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title class="text-h5 mb-1">
                Label Store
              </v-list-item-title>
              <v-list-item-subtitle>
                Please select lines and click on the corresponding label
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-btn
              fab
              x-small
              outlined
              @click="createLabelDialog = !createLabelDialog"
            >
              +
            </v-btn>
          </v-list-item>
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
                  >
                    {{ content }}
                  </v-btn>
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="createLabelDialog"
      max-width="350px"
    >
      <v-card>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newLabel.type"
                  :items="['participants', 'content']"
                  label="Categories"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newLabel.name"
                  label="Label Name"
                  required
                />
              </v-col>
              <v-col cols="12">
                <span> Label Color </span>
                <v-color-picker v-model="newLabel.color" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click="createLabelDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="createNewLabel"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {EditorContent} from "@tiptap/vue-2";
import {initSocket} from "../../../utils/webSocket";
import {initYDoc} from "../../../utils/yDoc";
import {initEditor} from "../../../utils/tiptapEditor";
import MenuBar from "./MenuBar";
import {mapGetters} from 'vuex';

let socket;

export default {
  name: "LabelWizardEditor",
  components: {
    EditorContent,
    MenuBar
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

      isRecording: false,
      isSpeaking: false,

      createLabelDialog: false,

      newLabel: {
        color: "",
        type: "",
        name: ""
      },

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
  },
  async mounted() {
    socket = await initSocket(this.nowDay);

    socket.on("WEB_RECORDING", async (e) => {
      console.log("WEB RECORDING STATUS: ", e)
      this.isRecording = e
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

    this.editor.chain().focus().user(currentUser).run();
  },
  methods: {
    addLabel(color, labelName) {
      //TODO different types and add double labels
      const {from, to, $from, $to} = this.editor.view.state.selection
      // const fromIndex = $from.posAtIndex()
      // const toIndex = $to.posAtIndex()
      let nodes = []
      this.editor.state.doc.nodesBetween(from, to, (node, pos) => {
        const { type: {name}, text, nodeSize } = node
        console.log(color, labelName, name, text)
        if (name==='text') nodes.push([color, labelName, pos, text, nodeSize])
      })

      for (let i=nodes.length-1; i>=0; i--) {
        const [color, labelName, pos, content, nodeSize] = nodes[i]
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
    createNewLabel() {
      const { type, color, name } = this.newLabel
      console.log(type)
      if (type === 'participants') this.participantsLabel.push([color, name])
      else this.contentLabel.push([color, name])

      this.createLabelDialog = false
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
