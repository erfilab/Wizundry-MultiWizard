<template>
  <v-container>
    <v-row>
      <v-col>
        <v-row v-if="curRole !== 'participant'">
          <v-col cols="12">
            <v-btn outlined @click="requestEditing"
            >Ctrl + Q = Request Editing Log</v-btn
            >
            <v-btn
                outlined
                @click="isTesting ? emitSpeakerEvent(false) : emitSpeakerEvent(true)"
            >Fn + F9 = 🎤 Microphone</v-btn
            >
            <v-btn
                outlined
                @click="speechLoading ? emitTalkEvent(false) : emitTalkEvent(true)"
            >Esc = 🔊 Speaker</v-btn
            >
          </v-col>
          <v-col cols="12">
            {{ Object.keys(projectInfo).slice(2, 12) }} <br />
            {{ Object.values(projectInfo).slice(2, 12) }}
          </v-col>
          <v-col>
            <v-switch
                v-model="autoHighlight"
                inset
                label="Auto HighLight"
            ></v-switch>
          </v-col>
          <v-col>
            <v-switch
                v-model="autoPunctuation"
                inset
                label="Auto Punctuation"
            ></v-switch>
          </v-col>
          <v-col cols="3">
            <v-btn
                @click="isTesting ? emitSpeakerEvent(false) : emitSpeakerEvent(true)"
                text
                :color="!isTesting ? 'grey' : isSpeaking ? 'red' : 'red darken-3'"
                class="mt-4"
            >
              <v-icon>{{
                  isTesting ? "mdi-microphone-off" : "mdi-microphone"
                }}</v-icon>
              {{ isTesting ? "speaking..." : "closed" }}
            </v-btn>
          </v-col>
          <v-col>
            <v-switch
                v-model="usingNativeRecognition"
                inset
                :disabled="isTesting || isSpeaking"
                :label="usingNativeRecognition ? 'Using Google?' : 'Using Native?'"
            ></v-switch>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col class="mt-3" cols="3" v-if="speechLoading">
            Rewound
            <transition name="fade" class="pl-2">
              <v-progress-circular indeterminate color="purple" small />
            </transition>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <div
            class="editor"
            v-if="editor"
            @keyup.120="isTesting ? emitSpeakerEvent(false) : emitSpeakerEvent(true)"
            @keyup.esc="speechLoading ? emitTalkEvent(false) : emitTalkEvent(true)"
            @keyup.ctrl.81="requestEditing"
            @click="getCoord"
        >
          <menu-bar
              v-show="curRole !== 'participant'"
              class="editor__header"
              :editor="editor"
          />
          <editor-content
              style=""
              class="editor__content"
              :editor="editor"
          />
          <div v-show="curRole !== 'participant'" class="editor__footer">
            <div :class="`editor__status editor__status--${status}`">
              <template v-if="status === 'connected'">
                {{ users.length }} user{{ users.length === 1 ? "" : "s" }} online in
                {{ projectInfo.projectName }}
              </template>
              <template v-else>
                offline
              </template>
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
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import MenuBar from "./MenuBar.vue";
import { SmilieReplacer } from "@/plugins/smileReplacer.ts";

import io from "socket.io-client";

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

      projectInfo: {
        projectName: "",
        projectId: "",
      },

      editPos: {},

      socket: null,

      //function bar
      autoHighlight: false,
      autoPunctuation: true,
      usingNativeRecognition: false,

      //web speech
      recognition: null,
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
      lastContent: "",

      //text preprocess
      keywords: [
        "However",
        "But",
        "but",
        "and",
        "And",
        "because",
        "Because",
        "Therefore",
        "whenever",
        "whereas",
        "Thus",
        "yet",
      ],
    };
  },
  computed: {
    ...mapGetters("user", ["getCurrentUser"]),
    curRole() {
      return this.currentUser.role;
    },
  },
  watch: {
    autoHighlight(newVal) {
      this.socket.emit("HIGHLIGHT", newVal);
    },
    newContent(text) {
      // this.editor.commands.keyboardShortcut('c-z')
      this.editor
        .chain()
        .focus()
        .undo()
        .run();
      console.log(this.autoHighlight)
      if (text && this.autoHighlight)
        this.keywords.map(
          (kw) =>
            (text = text.replace(new RegExp(kw, "g"), ` <mark>${kw}</mark>`))
        );
      const { size } = this.editor.view.state.doc.content;
      this.editor.commands.insertContent(`${text} `, size - 1);
      const insertTrans = this.editor.state.tr.insertText(``, size - 1);
      this.editor.view.dispatch(insertTrans);
    },
    getCurrentUser(newVal) {
      if (newVal) {
        console.log("Current USER >> ", newVal);
        this.initProject();
      }
    },
    runTimeContent(newVal, oldVal) {
      const { size } = this.editor.view.state.doc.content;

      if (newVal && !oldVal) {
        this.editor.commands.insertContent(`${newVal}`, size - 1);
      } else if (newVal && oldVal) {
        if (size > 1)
          this.editor
            .chain()
            .focus()
            .undo()
            .run();
        // if (this.autoHighlight) this.keywords.map(kw => newVal = newVal.replace(new RegExp(kw, "g"), ` <mark>${kw}</mark>`))
        this.editor.commands.insertContent(` ${newVal} `, size - 1);
      } else if (!newVal && oldVal) {
        // this.editor.commands.keyboardShortcut('c-z')
      }
    },
  },
  methods: {
    ...mapActions("text", ["storeTextData", "storeBehaviorLog", "storeAnchorLog"]),
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
    getCoord(e) {
      this.editPos.clientX = e.clientX
      this.editPos.clientY = e.clientY
      this.editPos.projectId = this.projectInfo.projectId
      this.editPos.timestamp = this.dayjs().valueOf()

      this.storeAnchorLog(this.editPos).then(() => console.log('pos', this.editPos.clientX, this.editPos.clientY))
    },
    requestEditing() {
      this.storeBehaviorLog({
        projectId: this.projectInfo.projectId,
        type: "REQUEST",
        status: true,
        timestamp: this.dayjs().valueOf(),
      });
    },
    // speech recognition
    startSpeechRecognition() {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
      this.isTesting = true;

      this.listenForSpeechEvents();
      this.recognition.onspeechstart = () => {
        this.isSpeaking = true;
      };

      this.recognition.onspeechend = () => {
        this.isSpeaking = false;
      };
      this.recognition.onresult = (event) => {
        this.runTimeContent = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
      };

      this.recognition.onend = () => {
        if (this.runTimeContent !== "") {
          let temp_rtc = this.runTimeContent;
          this.runTimeContent = "";
          this.newContent = temp_rtc;
        }
        this.recognition.stop();
        if (this.isTesting) this.recognition.start();
      };
      this.recognition.start();
    },
    endSpeechRecognition() {
      this.isTesting = false;
      this.recognition.stop();
    },
    emitSpeakerEvent(e) {
      this.isTesting = e;
      this.socket.emit("MICROPHONE", {
        status: e,
        punctuation: this.autoPunctuation,
      });
    },
    initRecording() {
      this.isTesting = this.isSpeaking = true;
      this.socket.emit("startGoogleCloudStream", this.currentUser.uid);
      this.audioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new this.audioContext({
        latencyHint: "interactive",
      });
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
    emitTalkEvent(e) {
      this.speechLoading = e;
      this.socket.emit("SPEAKER", {
        status: e,
        start: this.editor.state.selection.anchor,
      });
      this.emitSpeakerEvent(false);
    },
    listenForSpeechEvents() {
      this.audioSpeech.onstart = () => {
        this.speechLoading = true;
      };

      this.audioSpeech.onend = () => {
        this.speechLoading = false;
      };
    },
    speakBack(from) {
      const { size } = this.editor.view.state.doc.content;
      this.selectedText = this.editor.state.doc.textBetween(from, size, " ");
      this.audioSpeech.text = this.selectedText;
      this.audioSpeech.lang = "en-US";

      this.synth.speak(this.audioSpeech);
    },
    initProject() {
      if (this.$route.params.projectInfo) {
        const { projectInfo } = this.$route.params;
        this.projectInfo = {
          projectName: projectInfo.project_name,
          projectId: projectInfo.id,
          ...projectInfo,
        };
        if (this.curRole !== "participant") {
          this.storeBehaviorLog({
            projectId: this.projectInfo.projectId,
            type: "PROJ",
            status: true,
            timestamp: this.dayjs().valueOf(),
          });
        }
      }

      this.currentUser = this.getCurrentUser;
      this.currentUser.color = this.getRandomColor();

      const ydoc = new Y.Doc();
      let HOST =
        process.env.NODE_ENV === "production"
          ? "https://ryanyen2.me/"
          : "http://localhost:3000/";
      this.socket = io(HOST + this.projectInfo.projectName)
        .on('AUTO_HIGHLIGHT', e => {
          if (this.curRole === "participant")
            this.autoHighlight = e.status
        })
        .on("WEB_RECORDING", async (e) => {
          console.log("WEB RECORDING STATUS: ", e);
          if (e && this.curRole === "participant" && this.isTesting === false) {
            if (this.usingNativeRecognition) this.startSpeechRecognition();
            else this.initRecording();
          } else if (
            !e &&
            this.curRole === "participant" &&
            this.isTesting === true
          ) {
            if (this.usingNativeRecognition) this.endSpeechRecognition();
            else this.endRecording();
          }
          if (this.curRole !== "participant" && this.isTesting) {
            await this.storeBehaviorLog({
              projectId: this.projectInfo.projectId,
              type: "RECORD",
              status: e,
              timestamp: this.dayjs().valueOf(),
            });
          }
        })
        .on("WEB_SPEAKER", async (status) => {
          console.log("Speaker STATUS: ", status);
          if (
            status.status &&
            this.curRole === "participant" &&
            this.speechLoading === false
          ) {
            this.speakBack(status.start);
          } else if (!status.status && this.curRole === "participant") {
            this.synth.cancel();
          }
          if (this.curRole !== "participant") {
            await this.storeBehaviorLog({
              projectId: this.projectInfo.projectId,
              type: "SPEAKER",
              status: status.status,
              timestamp: this.dayjs().valueOf(),
            });
          }
        })
        .on("SPEECH_DATA", async (param) => {
          let { data, uid } = param;
          if (data && this.curRole === "participant" && this.isTesting && this.currentUser.uid === uid) {
            this.runTimeContent = data.results[0].alternatives[0].transcript;

            const dataFinal = data.results[0].isFinal;
            const { textContent } = this.editor.state.doc;

            if (dataFinal && this.runTimeContent) {
              let temp_cont = this.runTimeContent;
              this.runTimeContent = "";
              this.newContent = temp_cont;

              await this.storeTextData({
                type: "SPEECH",
                lastContent: textContent,
                newContent: this.newContent,
                projectId: this.projectInfo.projectId,
                projectName: this.projectInfo.projectName,
                username: this.currentUser.name,
                userRole: this.curRole,
                timestamp: this.dayjs().valueOf(),
              });
            }
          }
        });

      this.socket.emit("joinRoom", this.projectInfo.projectName);

      let YJS_HOST =
        process.env.NODE_ENV === "production"
          ? "wss://ryanyen2.me/yjs/"
          : "ws://localhost:3001";
      this.provider = new WebsocketProvider(
        YJS_HOST,
        this.projectInfo.projectName,
        ydoc
      );
      this.provider.on("status", (event) => (this.status = event.status));
      window.ydoc = ydoc;
      this.indexdb = new IndexeddbPersistence(
        this.projectInfo.projectName,
        ydoc
      );

      this.editor = new Editor({
        onSelectionUpdate: (e) => {
          this.editPos.innerHTML = e.editor.view.dom.innerHTML
          this.editPos.anchor = this.editor.state.selection.anchor
        },
        onUpdate: () => {
          const { textContent } = this.editor.state.doc;
          if (
            this.curRole !== "participant" &&
            textContent.length > 0 &&
            !this.isTesting &&
            textContent.length !== this.lastContent.length &&
            this.runTimeContent === ''
          ) {
            this.storeTextData({
              type: "EDIT",
              lastContent: this.lastContent,
              newContent: textContent,
              projectId: this.projectInfo.projectId,
              projectName: this.projectInfo.projectName,
              username: this.currentUser.name,
              userRole: this.curRole,
              timestamp: this.dayjs().valueOf(),
            });
          }
          this.lastContent = textContent;
        },
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
          // CollaborationCursor.configure({
          //   provider: this.provider,
          //   user: this.currentUser,
          //   onUpdate: users => {
          //     this.users = users
          //   },
          // }),
          CharacterCount.configure({
            limit: 10000,
          }),
        ],
      });
      // this.editor.chain().focus().user(this.currentUser).run()
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
  height: 1200px;
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
  font-size: 23px;
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
