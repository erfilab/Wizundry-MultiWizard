<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-col class="" cols="12">
          <v-row>
            <v-col cols="2">
              <v-btn
                @click="
                  isTesting ? emitSpeakerEvent(false) : emitSpeakerEvent(true)
                "
                :disabled="isUser"
                fab
                :color="
                  !isTesting ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'
                "
              >
                <v-icon
                  >{{ isTesting ? "mdi-microphone" : "mdi-microphone-off" }}
                </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="4" class="pt-5">
              <span> {{ isTesting ? "speaking..." : "closed" }} </span>
              <v-progress-linear
                :color="
                  !isTesting ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'
                "
                :indeterminate="isTesting"
              />
            </v-col>
          </v-row>
          <v-row v-if="isUser">
            <v-col cols="3">
              <v-btn
                fab
                :color="!speechLoading ? 'cyan' : 'cyan darken-3'"
                class="mt-2"
              >
                <v-icon
                  >{{ speechLoading ? "mdi-volume-high" : "mdi-volume-off" }}
                </v-icon>
              </v-btn>
            </v-col>
            <v-col class="pt-5">
              <span> {{ speechLoading ? "speaking..." : "closed" }} </span>
              <v-progress-linear
                :color="!speechLoading ? 'cyan' : 'cyan darken-3'"
                :indeterminate="speechLoading"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" v-if="isWizard">
          <div>
            <CommandBoxes
              @startSpeak="emitSpeakEvent"
              :talking.sync="speechLoading"
              :itemTalking.sync="itemTalking"
              :itemStyle="itemStyle"
            />
          </div>
        </v-col>
      </v-col>
      <v-col cols="6">
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
          <menu-bar v-if="isWizard" class="editor__header" :editor="editor" />
          <editor-content style="" class="editor__content" :editor="editor" />
          <div v-if="isWizard" class="editor__footer">
            <div :class="`editor__status editor__status--${status}`">
              <template v-if="status === 'connected'">
                {{ connectedUsers.length }} user{{
                  connectedUsers.length === 1 ? "" : "s"
                }}
                online in
                {{ this.nowDay }}
              </template>
              <template v-else> offline </template>
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
  </v-container>
</template>

<script>
import { EditorContent } from "@tiptap/vue-2";
import MenuBar from "./MenuBar.vue";

import { downSampleBuffer } from "../../../utils/webRecord";
import { initSocket } from "../../../utils/webSocket.js";
import { initYDoc } from "../../../utils/yDoc";
import { initEditor } from "../../../utils/tiptapEditor";

const BUFFER_SIZE = 2048;
const MEDIA_ACCESS_CONSTRAINTS = { audio: true, video: false };

import { mapGetters } from "vuex";
import CommandBoxes from "./CommandBoxes";

export default {
  components: {
    EditorContent,
    CommandBoxes,
    MenuBar,
  },
  data() {
    return {
      //editor
      provider: null,
      editor: null,
      status: "connecting",
      indexdb: null,

      socket: null,
      nowDay: new Date().toISOString().slice(0, 10),

      //web speech
      isTesting: false,
      isSpeaking: false,

      //web recording
      audioContext: null,
      context: null,
      processor: null,
      globalStream: null,
      audioInput: null,

      // web speaker
      speechLoading: false,
      synth: window.speechSynthesis,
      audioSpeech: new window.SpeechSynthesisUtterance(),
      itemTalking: -1,
      itemStyle: 1,

      runTimeContent: "",
      newContent: "",
    };
  },
  computed: {
    ...mapGetters([
      "userInfo",
      "connectedUsers",
      "roles",
      "isUser",
      "isWizard",
      "isAdmin",
    ]),
  },
  watch: {
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
    // take logs
    createNewLog(log) {
      if (this.isAdmin || log.type === "SPEECH_CONTENT") {
        const params = {
          username: this.userInfo.username,
          timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
          type: log.type || "",
          status: log.status || false,
          value: log.value || "",
        };
        this.$store.dispatch("CreateNewLog", params);
      }
    },
    //speaker
    emitSpeakEvent(item) {
      console.log("emitSpeakEvent >> ", item);
      this.emitSpeakerEvent(false);
      this.socket.emit("SPEAK", {
        id: item.id,
        content: item.title,
        style: item.style,
      });
    },
    // speaker from anchor point
    emitTalkEvent(event) {
      console.log("emitTalkEvent >> ", event);
      if (event) this.emitSpeakerEvent(false);
      this.socket.emit("SPEAK_FROM", {
        status: event,
        anchor: this.editor.state.selection.anchor,
      });
    },
    //microphone
    emitSpeakerEvent(e) {
      this.isTesting = e;
      this.socket.emit("MICROPHONE", { status: e });
    },
    initRecording() {
      this.isTesting = this.isSpeaking = true;
      this.socket.emit("startGoogleCloudStream", this.userInfo.uid);
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
        this.socket.emit("SPEAK", {
          id: this.itemTalking,
          content: "",
          style: this.itemStyle,
        });
      };
    },
    speakBack(text) {
      this.audioSpeech.text = text;
      this.audioSpeech.lang = "en-US";

      this.synth.speak(this.audioSpeech);
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
  },
  async mounted() {
    this.socket = await initSocket(this.nowDay);
    this.socket
      .on("WEB_RECORDING", async (e) => {
        console.log("WEB RECORDING STATUS: ", e);
        this.createNewLog({ type: "WEB_RECORDING", status: e });
        if (e && this.isUser && !this.isTesting) this.initRecording();
        else if (!e && this.isUser && this.isTesting) this.endRecording();
        else if (e && this.isWizard) this.isTesting = this.isSpeaking = true;
        else if (!e && this.isWizard) this.isTesting = this.isSpeaking = false;
      })
      .on("WEB_SPEAKER", async (param) => {
        console.log("WEB SPEAKER From Anchor: ", param);
        const { size } = this.editor.view.state.doc.content;
        const selectedText = this.editor.state.doc.textBetween(param.anchor, size, " ");
        this.createNewLog({
          type: "SPEAKER_FROM_ANCHOR",
          status: true,
          value: selectedText,
        });
        if (param.status && this.isUser && !this.speechLoading)
          this.speakBack(selectedText);
        else if (!param.status && this.isUser) {
          this.synth.cancel();
          this.speechLoading = false;
        }
      })
      .on("START_SPEAKER", async (data) => {
        console.log("START SPEAKER: ", data);
        this.createNewLog({
          type: "WEB_SPEAKER",
          status: true,
          value: data.content,
        });
        if (data.content.length > 0 && this.isUser) {
          this.speakBack(data.content);
        } else if (this.isUser) {
          this.synth.cancel();
          this.speechLoading = false;
        } else if (data && this.isWizard) {
          this.itemTalking = data.id;
          this.itemStyle = data.style;
          this.speechLoading = true;
        }
      })
      .on("END_SPEAKER", async () => {
        this.emitSpeakerEvent(true);
        console.log("END SPEAKER");
        this.createNewLog({ type: "WEB_SPEAKER", status: false });
        this.itemTalking = -1;
        this.itemStyle = 1;
        this.speechLoading = false;
      })
      .on("SPEECH_DATA", async (param) => {
        let { data, uid } = param;
        if (
          data &&
          this.isUser &&
          this.isTesting &&
          this.userInfo.uid === uid
        ) {
          this.runTimeContent = data.results[0].alternatives[0].transcript;
          const dataFinal = data.results[0].isFinal;

          if (dataFinal && this.runTimeContent) {
            let temp_cont = this.runTimeContent;
            this.runTimeContent = "";
            this.newContent = temp_cont;
            this.createNewLog({
              type: "SPEECH_CONTENT",
              value: this.newContent,
            });
          }
        }
      });

    this.socket.emit("joinRoom", "multiDoc");

    const [indexdb, ydoc, yDocProvider] = await initYDoc(this.nowDay);
    this.indexdb = indexdb;
    this.provider = yDocProvider;
    this.provider.on("status", (event) => (this.status = event.status));

    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
      name: this.userInfo.username,
      color: this.getRandomColor(),
    };

    this.editor = await initEditor(
      this.isWizard,
      ydoc,
      this.provider,
      currentUser
    );

    if (this.isWizard) this.editor.chain().focus().user(currentUser).run();
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    this.listenForSpeechEvents();
  },
  beforeDestroy() {
    this.editor.destroy();
    this.$store.commit("CLEAR_CONNECTED_USERS");
  },
};
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  min-height: 550px;
  width: 680px;
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