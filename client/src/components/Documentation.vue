<template>
  <v-container>
    <v-row v-if="currentRole === 'participant'">
      <div>
        <v-text-field v-model="runTimeContent">
        </v-text-field>
      </div>
    </v-row>

    <div class="text-area" v-if="currentRole === 'experimenter'"
         @keyup.down="wizardAddComment"
    >
      <v-btn
          @click.stop="isTesting ? endSpeechRecognition() : startSpeechRecognition()"
          icon
          :color="!isTesting ? 'grey' : (isSpeaking ? 'red' : 'red darken-3')"
          :class="{'animated infinite pulse': isTesting}"
      >
        <v-icon>{{ isTesting ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
      </v-btn>
      <quill-editor
          class="editor"
          ref="myTextEditor"
          :value="content"
          :options="editorOption"
          @change="onEditorChange"
      />
    </div>
    <div class="text-area" v-else>
      <TextEditor ></TextEditor>
      <quill-editor
          class="editor"
          ref="myBubbleEditor"
          :content="content"
          :options="bubbleEditorOption"
          @change="onEditorChange($event)"
      />
    </div>
  </v-container>
</template>

<script>
// import dedent from 'dedent'
import debounce from 'lodash/debounce'
import {quillEditor} from 'vue-quill-editor'

// import theme style
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

import {mapGetters} from 'vuex'
import dayjs from "dayjs";

import TextEditor from './TextEditor.vue'


export default {
  name: "TextArea",
  components: {
    quillEditor,
    TextEditor,
  },
  data() {
    return {
      ws: null,
      editorOption: {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{'header': 1}, {'header': 2}],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'script': 'sub'}, {'script': 'super'}],
            [{'indent': '-1'}, {'indent': '+1'}],
            [{'direction': 'rtl'}],
            [{'size': ['small', false, 'large', 'huge']}],
            [{'header': [1, 2, 3, 4, 5, 6, false]}],
            [{'font': []}],
            [{'color': []}, {'background': []}],
            [{'align': []}],
            ['clean'],
            ['link', 'image', 'video']
          ]
        }
      },
      bubbleEditorOption: {
        theme: 'bubble',
        placeholder: "every content，support html",
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'header': [1, 2, 3, 4, 5, 6, false]}],
            [{'color': []}, {'background': []}],
            [{'font': []}],
            [{'align': []}],
            ['link', 'image'],
            ['clean']
          ]
        }
      },

      content: "",
      sentences: [],

      // speech to text
      isTesting: false,
      isSpeaking: false,
      recognition: null,
      runTimeContent: "",

      //pre process text
      keywords: "however but and because whenever whereas thus yet"
    }
  },
  watch: {
    sentences(newSentences) {
      let ns = newSentences[newSentences.length - 1].content
      if (!this.content) this.content += ns
      else this.content = this.content.replace(/<\/p>/g, ` ${ns}</p>`);
      console.log(this.content)
    }
  },
  methods: {
    onEditorChange: debounce(function (value) {
      console.log(value)
      this.preProcessContent(value.html);
    }, 466),
    wizardAddComment(){
      this.ws.send(
          JSON.stringify({
            type: 'modification',
            username: this.getCurrentUser.username,
            message: this.content,
            timestamp: dayjs()
          })
      )
    },
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

      this.recognition.onresult = (event) => {
        this.runTimeContent = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
      }

      this.recognition.onend = () => {
        if (this.runTimeContent !== "") {
          this.ws.send(
              JSON.stringify({
                type: 'sentence',
                username: this.getCurrentUser.username,
                message: this.runTimeContent,
                timestamp: dayjs()
              })
          )
          if (process.env.NODE_ENV === 'development') this.content += this.runTimeContent
          this.runTimeContent = ""
        }
        this.recognition.stop()
        if (this.isTesting) this.recognition.start()
      }
      this.recognition.start()
    },
    endSpeechRecognition() {
      console.log("Stopped", this.recognition)
      this.isTesting = false
      this.recognition.stop()
    },
    async preProcessContent(htmlVal) {
      // TODO: PUNCTUATION
      if (process.env.NODE_ENV === 'production') {
         let headers = { 'Access-Control-Allow-Origin': '*' }
        await this.$http.post('http://bark.phon.ioc.ee/punctuator',
          { "text": htmlVal }, {headers})
          .then(res => this.content = res.data)
      }
    }
  },
  computed: {
    editor() {
      return this.$refs.myTextEditor.quill
    },
    keywordList() {
      return this.keywords.split(' ')
    },
    ...mapGetters('auth', ['getCurrentUser']),
    currentRole() {
      return this.getCurrentUser.role
    }
  },
  mounted() {
    console.log(process.env)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    if (process.env.NODE_ENV === 'production')
      this.ws = new WebSocket("wss://" + window.location.host + "/wss");
    else
      this.ws = new WebSocket("ws://" + window.location.host + "/ws");


    this.ws.addEventListener("message", e => {
      let msg = JSON.parse(e.data);
      if (msg.type === 'modification') {
        this.content = msg.message
      } else if (msg.type === 'sentence') {
        this.sentences.push({
          sender: msg.username,
          content: msg.message,
          time: msg.timestamp,
        })
      }
    });
  },
}
</script>

<style lang="css">
.ql-toolbar {
  background-color: #cccccc;
}

.text-area {
  background-color: #151E27;
  color: white;
  display: flex;
  flex-direction: column;
}

.text-area .editor {
  height: 25rem;
  overflow: hidden;
  border-radius: 8px;
}

.text-area .output {
  width: 100%;
  height: 20rem;
  margin: 0;
  border: 1px solid #cccccc;
  overflow-y: auto;
  resize: vertical;
}

.text-area .output.code {
  padding: 1rem;
  height: 16rem;
}

.text-area .output.ql-snow {
  border-top: none;
  height: 24rem;
}
</style>
