<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-col cols="12">
          <v-card>
            <CommandBoxes @startSpeak="emitSpeakEvent" />
          </v-card>
        </v-col>
        <v-col class="mt-3" cols="12">
          <v-row>
            <v-col cols="3">
              <v-btn
                @click="
                  isTesting ? emitSpeakerEvent(false) : emitSpeakerEvent(true)
                "
                fab
                :color="
                  !isTesting ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'
                "
                class="mt-4"
              >
                <v-icon
                  >{{ isTesting ? "mdi-microphone-off" : "mdi-microphone" }}
                </v-icon>
              </v-btn>
            </v-col>
            <v-col class="pt-5">
              <span> {{ isTesting ? "speaking..." : "closed" }} </span>
              <v-progress-linear
                :color="
                  !isTesting ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'
                "
                :indeterminate="isTesting"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-col>
      <v-col cols="8">
        <div
          class="editor"
          v-if="editor"
          @keyup.120="
            isTesting ? emitSpeakerEvent(false) : emitSpeakerEvent(true)
          "
          @keyup.esc="
            speechLoading ? emitTalkEvent(false) : emitTalkEvent(true)
          "
        >
          <menu-bar class="editor__header" :editor="editor" />
          <editor-content style="" class="editor__content" :editor="editor" />
          <div class="editor__footer">
            <div :class="`editor__status editor__status--${status}`">
              <template v-if="status === 'connected'">
                {{ users.length }} user{{
                  users.length === 1 ? "" : "s"
                }}
                online in
                {{ this.dayjs().format("YYYY-MM-DD") }}
              </template>
              <template v-else> offline </template>
            </div>
            <div class="editor__name">
              <button>
                {{ currentUser.name }}
              </button>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import { SmilieReplacer } from "@/plugins/smileReplacer.ts";
import CommandBoxes from "@/components/MultiWizard/CommandBoxes";

import io from "socket.io-client";
import MenuBar from "../Paragraph/MenuBar";

const BUFFER_SIZE = 2048;
const MEDIA_ACCESS_CONSTRAINTS = { audio: true, video: false };
const downSampleBuffer = (buffer, sampleRate, outSampleRate) => {
  if (outSampleRate === sampleRate) return buffer;
  if (outSampleRate > sampleRate)
    throw "downsampling rate should be smaller than original sample rate";
  const sampleRateRatio = sampleRate / outSampleRate;
  let result = new Int16Array(Math.round(buffer.length / sampleRateRatio));
  let offsetResult = 0,
    offsetBuffer = 0;

  while (offsetResult < result.length) {
    let nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0,
      count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }

    result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result.buffer;
};

import { mapGetters, mapActions } from "vuex";

const getRandomElement = (list) =>
  list[Math.floor(Math.random() * list.length)];

export default {
  components: {
    EditorContent,
    CommandBoxes,
    MenuBar,
  },
  data() {
    return {
      //editor
      currentUser: {},
      provider: null,
      indexdb: null,
      editor: null,
      users: [],
      status: "connecting",

      socket: null,

      //web speech
      isTesting: false,
      isSpeaking: false,

      //web recording
      audioContext: null,
      context: null,
      processor: null,
      globalStream: null,
      audioInput: null,

      speechLoading: false,
      selectedText: "",
      synth: window.speechSynthesis,
      audioSpeech: new window.SpeechSynthesisUtterance(),

      runTimeContent: "",
      newContent: "",
    };
  },
  computed: {
    ...mapGetters("user", ["getCurrentUser"]),
    curRole() {
      return this.currentUser.role;
    },
  },
  watch: {
    getCurrentUser(newVal) {
      if (newVal) {
        console.log("Current USER >> ", newVal);
        this.initProject();
      }
    },
    newContent(text) {
      this.editor.chain().focus().undo().run();

      const { size } = this.editor.view.state.doc.content;
      this.editor.commands.insertContent(`${text} `, size - 1);
      const insertTrans = this.editor.state.tr.insertText(``, size - 1);
      this.editor.view.dispatch(insertTrans);
    },
    runTimeContent(newVal, oldVal) {
      const { size } = this.editor.view.state.doc.content;

      if (newVal && !oldVal) {
        this.editor.commands.insertContent(`${newVal}`, size - 1);
      } else if (newVal && oldVal) {
        if (size > 1) this.editor.chain().focus().undo().run();
        this.editor.commands.insertContent(` ${newVal} `, size - 1);
      }
    },
  },
  methods: {
    ...mapActions("text", [
      "storeTextData",
      "storeBehaviorLog",
      "storeAnchorLog",
    ]),
    getRandomColor() {
      return getRandomElement([
        "#958DF1",
        "#F98181",
        "#FBBC88",
        "#FAF594",
        "#70CFF8",
        "#94FADB",
        "#B9F18D",
      ]);
    },
    //speaker
    emitSpeakEvent(text) {
      console.log("emitSpeakEvent >> ", text);
      this.socket.emit("SPEAK", { content: text });
    },
    //microphone
    emitSpeakerEvent(e) {
      this.isTesting = e;
      this.socket.emit("MICROPHONE", {
        status: e,
        punctuation: true,
      });
    },
    initRecording() {
      this.isTesting = this.isSpeaking = true;
      this.socket.emit("startGoogleCloudStream", this.currentUser.uid);
      this.audioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new this.audioContext({ latencyHint: "interactive" });
      this.processor = this.context.createScriptProcessor(BUFFER_SIZE, 1, 1);
      this.processor.connect(this.context.destination);
      this.context.resume();

      const handleSuccess = (stream) => {
        this.globalStream = stream;
        this.audioInput = this.context.createMediaStreamSource(stream);
        this.audioInput.connect(this.processor);

        this.processor.onaudioprocess = (e) => this.microphoneProcess(e);
      };
      navigator.mediaDevices
        .getUserMedia(MEDIA_ACCESS_CONSTRAINTS)
        .then(handleSuccess);
    },
    endRecording() {
      this.isTesting = this.isSpeaking = false;
      this.socket.emit("endGoogleCloudStream", "");

      let track = this.globalStream.getTracks()[0];
      track.stop();

      this.audioInput.disconnect(this.processor);
      this.processor.disconnect(this.context.destination);
      this.context.close().then(() => {
        this.audioInput = null;
        this.processor = null;
        this.context = null;
        this.audioContext = null;
      });
    },
    microphoneProcess(e) {
      let left = e.inputBuffer.getChannelData(0);
      let left16 = downSampleBuffer(left, 44100, 16000);
      this.socket.emit("BINARY_DATA", left16);
    },
    listenForSpeechEvents() {
      this.audioSpeech.onstart = () => {
        this.speechLoading = true;
      };

      this.audioSpeech.onend = () => {
        this.speechLoading = false;
      };
    },
    speakBack(text) {
      this.audioSpeech.text = text;
      this.audioSpeech.lang = "en-US";

      this.synth.speak(this.audioSpeech);
    },
    initProject() {
      this.currentUser = this.getCurrentUser;
      this.currentUser.color = this.getRandomColor();

      const ydoc = new Y.Doc();
      let HOST =
        process.env.NODE_ENV === "production"
          ? "https://ryanyen2.tech/"
          : "http://localhost:3000/";
      this.socket = io(HOST + this.dayjs().format("YYYY-MM-DD"))
        .on("WEB_RECORDING", async (e) => {
          console.log("WEB RECORDING STATUS: ", e);
          if (e && this.curRole === "participant" && this.isTesting === false) {
            this.initRecording();
          } else if (
            !e &&
            this.curRole === "participant" &&
            this.isTesting === true
          ) {
            this.endRecording();
          }
        })
        .on("START_SPEAKER", async (data) => {
          console.log("START SPEAKER: ", data);
          if (
            data &&
            this.curRole === "participant"
          ) this.speakBack(data.content);
          else if (this.curRole === "participant") this.synth.cancel();
        })
        .on("SPEECH_DATA", async (param) => {
          let { data, uid } = param;
          if (
            data &&
            this.curRole === "participant" &&
            this.isTesting &&
            this.currentUser.uid === uid
          ) {
            this.runTimeContent = data.results[0].alternatives[0].transcript;

            const dataFinal = data.results[0].isFinal;

            if (dataFinal && this.runTimeContent) {
              let temp_cont = this.runTimeContent;
              this.runTimeContent = "";
              this.newContent = temp_cont;
            }
          }
        });

      this.socket.emit("joinRoom", "default");

      let YJS_HOST =
        process.env.NODE_ENV === "production"
          ? "wss://ryanyen2.tech/yjs/"
          : "ws://localhost:3001";
      this.provider = new WebsocketProvider(
        YJS_HOST,
        this.dayjs().format("YYYY-MM-DD"),
        ydoc
      );
      this.provider.on("status", (event) => (this.status = event.status));
      window.ydoc = ydoc;
      this.indexdb = new IndexeddbPersistence(
        this.dayjs().format("YYYY-MM-DD"),
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
          SmilieReplacer,
          Collaboration.configure({
            document: ydoc,
          }),
          CollaborationCursor.configure({
            provider: this.provider,
            user: this.currentUser.uid,
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
  mounted() {},
  beforeDestroy() {
    this.editor.destroy();
    this.provider.destroy();
  },
};
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  min-height: 550px;
  width: 700px;
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
