<template>
  <div>
    <v-row>
      <v-col cols="8">
        <v-row>
          <v-col cols="3">
            <v-btn
              :disabled="true"
              text
              :color="!isRecording ? 'grey' : 'cyan'"
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
        <v-row>
          <v-col cols="3">
            <v-btn
              :disabled="true"
              text
              :color="isSpeaking ? 'cyan' : 'cyan darken-3'"
            >
              {{ isSpeaking ? "speaking..." : "closed" }}
              <v-icon>
                {{ isSpeaking ? "mdi-volume-high" : "mdi-volume-off" }}
              </v-icon>
            </v-btn>
          </v-col>
          <v-col class="pt-5 mt-2">
            <v-progress-linear
              :color="!isSpeaking ? 'cyan' : 'cyan darken-3'"
              :indeterminate="isSpeaking"
            />
          </v-col>
        </v-row>
        <div
          v-if="editor"
          class="editor"
        >
          <editor-content
            style=""
            class="editor__content"
            :editor="editor"
          />
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
  </div>
</template>

<script>
let socket, audioContext, context, processor, globalStream, audioInput;
const synth = window.speechSynthesis;
const audioSpeech = new window.SpeechSynthesisUtterance();
import {EditorContent} from "@tiptap/vue-2";
import {downSampleBuffer} from "../../../utils/webRecord";
import {initSocket} from "../../../utils/webSocket.js";
import {initYDoc} from "../../../utils/yDoc";
import {initEditor} from "../../../utils/tiptapEditor";
import {Hooper, Slide} from 'hooper';
import 'hooper/dist/hooper.css';

const BUFFER_SIZE = 2048;
const MEDIA_ACCESS_CONSTRAINTS = {audio: true, video: false};

import {mapGetters} from "vuex";

export default {
  name: "UserEditor",
  components: {
    EditorContent,
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

      isSpeaking: false,
      isRecording: false,

      runTimeContent: "",
      finalContent: "",
      contentAnchor: 0,

      yDocProvider: null,
      editor: null,

      // notes
      currentSelectedNote: {},
      notesList: [],
    }
  },
  watch: {
    finalContent(text) {
      if (text.length) {
        this.editor
          .chain()
          .focus()
          .command(({editor, tr}) => {
            tr.delete(this.contentAnchor, tr.selection.anchor);
            return true;
          })
          .focus("end")
          .insertContent(`${text} `)
          .run();
      } else {
        this.editor.chain().focus("end").insertContent(`${text} `).run();
      }
      this.editor
        .chain()
        .focus("end")
        .setHardBreak()
        .focus("end")
        .command(({tr}) => {
          this.contentAnchor = tr.selection.anchor;
          return true;
        })
        .run();
    },
    runTimeContent(text, old) {
      try {
        if (text && old) {
          this.editor
            .chain()
            .focus()
            .command(({editor, tr}) => {
              tr.delete(this.contentAnchor, tr.selection.anchor);
              return true;
            })
            .focus("end")
            .insertContent(`${text} `)
            .run();
        }
        this.editor.chain().focus("end").setHardBreak().focus("end").run();
      } catch (err) {
        console.error(err);
        this.editor
          .chain()
          .focus("end")
          .command(({tr}) => {
            this.contentAnchor = tr.selection.anchor - 1 >= 0 ? tr.selection.anchor - 1 : tr.selection.anchor;
          });
      }
    },
  },
  beforeDestroy() {
    this.editor.destroy();
    this.yDocProvider.destroy();
  },
  async mounted() {
    socket = await initSocket(this.nowDay)

    socket
      .on("WEB_RECORDING", async (e) => {
        console.log("WEB RECORDING STATUS: ", e);
        if (e && !this.isRecording) this.initRecording();
        else if (!e && this.isRecording) this.endRecording();
      })
      .on("WEB_SPEAKER", async (data) => {
        console.log("WEB_SPEAKER", data)
        if (!data.status) {
          synth.cancel();
          this.isSpeaking = false
        } else {
          this.speakBack(data.content);
        }
      })
      .on("SPEECH_DATA", async (data) => {
        if (data) {
          this.runTimeContent = data.results[0].alternatives[0].transcript;
          if (data.results[0].isFinal && this.runTimeContent) {
            let temp_cont = this.runTimeContent;
            this.runTimeContent = "";
            this.finalContent = temp_cont;
          }
        }
      })
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

    this.editor = await initEditor(
      false,
      ydoc,
      this.yDocProvider,
      {
        name: this.userInfo.username,
        color: "#958DF1",
      }
    );

    this.editor.on("selectionUpdate", ({editor, event}) => {
      if (editor.state.selection.content().size > 0) {
        this.setCurrentSelectedNote(editor)
      }
    })
    setTimeout(this.findCommentsAndStoreValues, 500)

    this.listenForSpeechEvents();
  },
  methods: {
    setCurrentSelectedNote(editor) {
      const note = editor.getAttributes('note').note
      if (note) {
        const parsedNote = JSON.parse(editor.getAttributes('note').note);
        this.currentSelectedNote = parsedNote
        this.$refs.verticalNotesList.slideTo(
          this.notesList.map(n => n.uuid).indexOf(parsedNote.uuid)
        );
      } else {
        this.currentSelectedNote = {}
      }
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
    listenForSpeechEvents() {
      audioSpeech.onstart = () => {
        this.isSpeaking = true;
      };

      audioSpeech.onend = () => {
        this.isSpeaking = false;
        socket.emit("SPEAKER", {
          type: 'SPEAKER_END',
          trialName: this.trialInfo.trialName,
          userId: this.userInfo.userId,
          content: '',
          status: false
        });
      };
    },
    // speaker
    speakBack(text) {
      audioSpeech.text = text;
      audioSpeech.lang = "en-US";

      synth.speak(audioSpeech);
    },

    // mic recording
    initRecording() {
      this.isRecording = true;
      socket.emit("startGoogleCloudStream", {
        trialName: this.trialInfo.trialName,
        userId: this.userInfo.userId,
      });
      audioContext = window.AudioContext || window.webkitAudioContext;
      context = new audioContext({latencyHint: "interactive"});
      processor = context.createScriptProcessor(BUFFER_SIZE, 1, 1);
      processor.connect(context.destination);
      context.resume();

      const handleSuccess = (stream) => {
        globalStream = stream;
        audioInput = context.createMediaStreamSource(stream);
        audioInput.connect(processor);

        processor.onaudioprocess = (e) => this.microphoneProcess(e);
      };
      navigator.mediaDevices
        .getUserMedia(MEDIA_ACCESS_CONSTRAINTS)
        .then(handleSuccess);
    },
    endRecording() {
      this.isRecording = false;
      socket.emit("endGoogleCloudStream");

      let track = globalStream.getTracks()[0];
      track.stop();

      audioInput.disconnect(processor);
      processor.disconnect(context.destination);
      context.close().then(() => {
        audioInput = null;
        processor = null;
        context = null;
        audioContext = null;
      });
    },
    microphoneProcess(e) {
      let left = e.inputBuffer.getChannelData(0);
      let left16 = downSampleBuffer(left, 44100, 16000);
      socket.emit("BINARY_DATA", left16);
    },

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
