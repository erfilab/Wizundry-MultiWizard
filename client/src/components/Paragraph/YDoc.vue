<template>
  <v-container>
    <v-row v-if="curRole==='experimenter'">
      <v-col cols="3">
        <v-btn
            @click="isTesting? emitCloseSR() : emitOpenSR()"
            text
            :color="!isTesting ? 'grey' : (isSpeaking ? 'red' : 'red darken-3')"
            class="mt-4"
        >
          <v-icon>{{ isTesting ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
          {{ isTesting ? 'speaking...' : 'closed' }}
        </v-btn>
      </v-col>
      <v-spacer/>
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
            disabled
            label="Auto Punctuation"
        ></v-switch>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col class="mt-3" cols="3" v-if="speechLoading">
        Rewound
        <transition name="fade" class="pl-2">
          <v-progress-circular
              indeterminate
              color="purple"
              small
          />
        </transition>
      </v-col>
      <v-col :cols="speechLoading? 9:12">
        <v-text-field v-model="runTimeContent"/>
      </v-col>
    </v-row>
    <div class="editor" v-if="editor" @keyup.esc="speechLoading? emitTalkEvent(false) : emitTalkEvent(true)">
      <menu-bar v-show="curRole==='experimenter'" class="editor__header" :editor="editor"/>
      <editor-content class="editor__content" :editor="editor"/>
      <div v-show="curRole==='experimenter'" class="editor__footer">
        <div :class="`editor__status editor__status--${status}`">
          <template v-if="status === 'connected'">
            {{ users.length }} user{{ users.length === 1 ? '' : 's' }} online in {{ room }}
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
  </v-container>

</template>

<script>
import {Editor, EditorContent} from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import * as Y from 'yjs'
import {WebsocketProvider} from 'y-websocket'
import {IndexeddbPersistence} from 'y-indexeddb'
import MenuBar from './MenuBar.vue'
import {TextHighlighter} from "@/plugins/textHighlighter.ts";
import {SmilieReplacer} from "@/plugins/smileReplacer.ts";

import io from 'socket.io-client'
import ss from '@sap_oss/node-socketio-stream'
import {todayCollection} from '@/firebase.js'

import {mapGetters} from 'vuex'

const getRandomElement = list => {
  return list[Math.floor(Math.random() * list.length)]
}

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
      status: 'connecting',
      room: 'project1',

      socket: null,

      //function bar
      autoHighlight: true,
      autoPunctuation: false,

      //webspeech
      recognition: null,
      isTesting: false,
      isSpeaking: false,
      resultError: false,
      textResult: "",
      scriptNode: null,
      ssStream: null,
      audioContext: new (window.AudioContext || window.webkitAudioContext)(),

      speechLoading: false,
      selectedText: '',
      synth: window.speechSynthesis,
      audioSpeech: new window.SpeechSynthesisUtterance(),

      runTimeContent: "",
      newContent: "",

      //text preprocess
      keywords: ["however", "but", "and", "because", "whenever", "whereas", "thus", "yet"],
    }
  },
  computed: {
    ...mapGetters('auth', ['getCurrentUser']),
    curRole() {
      return this.currentUser.role
    }
  },
  watch: {
    newContent(text) {
      this.keywords.map(kw =>
          text = text.replace(new RegExp(kw, "g"), ` <mark>${kw}</mark>`)
      )
      console.log("TText", text)
      const {size} = this.editor.view.state.doc.content

      this.editor.commands.insertContent(` ${text} `, size - 1)
      const insertTrans = this.editor.state.tr.insertText(` `, size - 1)
      this.editor.view.dispatch(insertTrans)
    },
  },
  methods: {
    getRandomColor() {
      return getRandomElement([
        '#958DF1',
        '#F98181',
        '#FBBC88',
        '#FAF594',
        '#70CFF8',
        '#94FADB',
        '#B9F18D',
      ])
    },
    // speech recognition
    startSpeechRecognition() {
      this.isTesting = true
      this.recognition.onspeechstart = () => {
        console.log("Speech Start")
        this.isSpeaking = true
      }

      this.recognition.onspeechend = () => {
        console.log("Speech End")
        this.isSpeaking = false
      }
      this.recognition.onresult = event => {
        this.runTimeContent = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
      }

      this.recognition.onend = () => {
        if (this.runTimeContent !== "") {
          this.newContent = this.runTimeContent
          this.runTimeContent = ""
        }
        this.recognition.stop()
        if (this.isTesting) this.recognition.start()
      }
      this.recognition.start()
    },
    endSpeechRecognition() {
      this.isTesting = false
      this.recognition.stop()
    },
    startRecording() {
      const languageSelected = 'en-US';
      this.socket.emit('LANGUAGE_SPEECH', languageSelected);
      this.isSpeaking = true;
      this.scriptNode.connect(this.audioContext.destination);
      ss(this.socket).emit('START_SPEECH', this.ssStream);
      setInterval(function () {
        this.stopRecording();
      }.bind(this), 55000);
    },
    stopRecording() {
      this.isTesting = false
      this.isSpeaking = false;
      this.scriptNode.disconnect(this.audioContext.destination);
      this.ssStream.end();
      this.socket.emit('STOP_SPEECH', {});
    },
    successCallback(stream) {
      // const vm = this;
      console.log('successCallback:....IN');
      let input = this.audioContext.createMediaStreamSource(stream);
      let bufferSize = 2048;
      this.scriptNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
      this.scriptNode.onaudioprocess = scriptNodeProcess;
      input.connect(this.scriptNode);

      // console.log('ScriptNode BufferSize:', scriptNode.bufferSize);
      function scriptNodeProcess(audioProcessingEvent) {
        let inputBuffer = audioProcessingEvent.inputBuffer;
        let outputBuffer = audioProcessingEvent.outputBuffer;
        let inputData = inputBuffer.getChannelData(0);
        let outputData = outputBuffer.getChannelData(0);

        // Loop through the 4096 samples
        for (let sample = 0; sample < inputBuffer.length; sample++) {
          outputData[sample] = inputData[sample];
        }

        // this.ssStream.write(new ss.Buffer(vm.downsampleBuffer(inputData, 44100, 16000)));
      }
    },
    downsampleBuffer(buffer, sampleRate, outSampleRate) {
      if (outSampleRate === sampleRate) {
        return buffer;
      }
      if (outSampleRate > sampleRate) {
        throw "downsampling rate show be smaller than original sample rate";
      }
      let sampleRateRatio = sampleRate / outSampleRate;
      let newLength = Math.round(buffer.length / sampleRateRatio);
      let result = new Int16Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      while (offsetResult < result.length) {
        let nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0,
            count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
        }

        result[offsetResult] = Math.min(1, accum / count) * 0x7FFF;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
      return result.buffer;
    },
    errorCallback(error) {
      console.log('errorCallback:', error);
    },
    emitCloseSR() {
      this.isTesting = false
      this.socket.emit('mic', false)
    },
    emitOpenSR() {
      this.isTesting = true
      this.socket.emit('mic', true)
    },
    emitTalkEvent(e) {
      this.socket.emit('speaker', {status: e, start: this.editor.state.selection.anchor})
    },
    listenForSpeechEvents() {
      this.audioSpeech.onstart = () => {
        this.speechLoading = true
      }

      this.audioSpeech.onend = () => {
        this.speechLoading = false
      }
    },
    speakBack(from) {
      const {size} = this.editor.view.state.doc.content
      this.selectedText = this.editor.state.doc.textBetween(from, size, ' ')
      this.audioSpeech.text = this.selectedText
      this.audioSpeech.lang = "en-US";
      console.log(this.audioSpeech)
      this.synth.speak(this.audioSpeech)
    }
  },
  mounted() {
    const ydoc = new Y.Doc()
    this.ssStream = ss.createStream()

    let HOST = 'http://localhost:3000/'
    if (process.env.NODE_ENV === 'production')
      HOST = 'https://ryanyen2.me/'

    this.socket = io(HOST + this.room)
        .on('wspeech', event => {
          console.log("Mic event", event)
          if (event && this.curRole === 'participant' && this.isTesting === false) {
            // this.startSpeechRecognition()
            this.startRecording()
          } else if (!event && this.curRole === 'participant' && this.isTesting === true) {
            // this.endSpeechRecognition()
            this.stopRecording()
          }
        })
        .on('wspeaker', event => {
          console.log("Speaker event", event)
          if (event.status && this.curRole === 'participant' && this.speechLoading === false) {
            this.speakBack(event.start)
          } else if (!event.status && this.curRole === 'participant' && this.speechLoading === true) {
            this.synth.cancel()
          }
        })
        .on('SPEECH_RESULTS', text => {
          if ('Reached_transcription_time_limit' === text) {
            this.resultError = true;
          } else {
            console.log("RE, ", text)
            this.textResult += text;
          }
        })

    this.socket.emit('joinRoom', this.room)


    let YJS_HOST = 'ws://localhost:3001'
    if (process.env.NODE_ENV === 'production')
      YJS_HOST = 'wss://ryanyen2.me/yjs/'
    this.provider = new WebsocketProvider(YJS_HOST, this.room, ydoc)
    this.provider.on('status', event => {
      this.status = event.status
    })

    window.ydoc = ydoc
    this.indexdb = new IndexeddbPersistence(this.room, ydoc)

    this.editor = new Editor({
      onUpdate: () => {
        const {textContent} = this.editor.state.doc
        todayCollection.add({
          timestamp: this.dayjs().format("YYYY-MM-DD HH:mm:ss"),
          anchor: this.editor.state.selection.anchor,
          content: textContent,
          room: this.room,
          username: this.currentUser.name,
          userEmail: this.currentUser.email
        })
      },
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Highlight,
        TaskList,
        TaskItem,
        SmilieReplacer,
        TextHighlighter,
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: this.provider,
          user: this.currentUser,
          onUpdate: users => {
            this.users = users
          },
        }),
        CharacterCount.configure({
          limit: 10000,
        }),
      ],
    })
    this.currentUser = this.getCurrentUser
    this.currentUser.color = this.getRandomColor()
    this.editor.chain().focus().user(this.currentUser).run()
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser))

    // webspeech
    // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // this.recognition = new SpeechRecognition();
    // this.recognition.interimResults = true;
    // this.recognition.lang = "en-US";
    if (navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia supported...');
      navigator.webkitGetUserMedia({audio: true}, stream => {
        if (this.ssStream)
          console.log("SStream: ", this.ssStream)
          this.successCallback(stream);
      }, error => this.errorCallback(error));
    } else {
      console.log('getUserMedia not supported on your browser!');
    }

    this.listenForSpeechEvents()
  },
  beforeDestroy() {
    this.editor.destroy()
    this.provider.destroy()
  },
}
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  max-height: 400px;
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
  content: ' ';
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

.ProseMirror ul, .ProseMirror ol {
  padding: 0 1rem;
}

.ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
  line-height: 1.1;
}

.ProseMirror code {
  background-color: rgba(97, 97, 97, 0.1);
  color: #616161;
}

.ProseMirror pre {
  background: #0d0d0d;
  color: #fff;
  font-family: 'JetBrainsMono', monospace;
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
