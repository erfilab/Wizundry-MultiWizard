<template>
  <v-container>
    <template v-if="editor && !loading">
      <v-row class="mb-5 mt-5" v-show="currentRole==='experimenter'">
        <v-col cols="8" align-self="left">
          {{ count }} {{ count === 1 ? 'user' : 'users' }} connected to {{ projectPath }}/{{ docName }}
        </v-col>
        <v-spacer />
        <v-col cols="1">
          <transition name="fade" v-if="speechLoading">
            <v-progress-circular
                indeterminate
                color="purple"
            />
          </transition>
        </v-col>
        <v-col>
          <v-btn @click.stop="greet">
            Read Back
          </v-btn>
        </v-col>
      </v-row>

      <editor-menu-bar v-show="currentRole==='experimenter'" :editor="editor">
        <div class="menubar" slot-scope="{ commands, isActive }">
<!--          <button-->
<!--              @click="this.editor.chain().focus().toggleHighlight().run()"-->
<!--              :class="{ 'is-active': editor.isActive('highlight') }"-->
<!--          >-->
<!--            highlight (any)-->
<!--          </button>-->
          <button
              class="menubar__button"
              :class="{ 'is-active': isActive.bold() }"
              @click="commands.bold"
          >
          <span>
            <b>U</b>
          </span>
          </button>

          <button
              class="menubar__button"
              :class="{ 'is-active': isActive.italic() }"
              @click="commands.italic"
          >
          <span>
            <i>U</i>
          </span>
          </button>

          <button
              class="menubar__button"
              :class="{ 'is-active': isActive.underline() }"
              @click="commands.underline"
          >
          <span>
            <u>U</u>
          </span>
          </button>

          <button
              class="menubar__button"
              :class="{ 'is-active': isActive.code() }"
              @click="commands.code"
          >
            <span>code</span>
          </button>

          <button
              class="menubar__button"
              :class="{ 'is-active': isActive.paragraph() }"
              @click="commands.paragraph"
          >
            <span>P</span>
          </button>

          <button
              class="menubar__button"
              :class="{ 'is-active': isActive.heading({ level: 1 }) }"
              @click="commands.heading({ level: 1 })"
          >H1</button>

          <button
              class="menubar__button"
              :class="{ 'is-active': isActive.heading({ level: 2 }) }"
              @click="commands.heading({ level: 2 })"
          >H2</button>

          <button
              class="menubar__button"
              :class="{ 'is-active': isActive.heading({ level: 3 }) }"
              @click="commands.heading({ level: 3 })"
          >H3</button>

          <button class="menubar__button" @click="commands.undo">
            <span>undo</span>
          </button>

          <button class="menubar__button" @click="commands.redo">
            <span>redo</span>
          </button>
        </div>
      </editor-menu-bar>

      <editor-content class="editor__content" :editor="editor">
      </editor-content>

<!--      <v-card>-->
<!--        <v-card-text>-->
<!--          {{localHTML}}-->
<!--        </v-card-text>-->
<!--      </v-card>-->


      <v-row v-show="currentRole==='participant'">
        <v-text-field
            disabled
            solo
            v-model="runTimeContent"
        />
      </v-row>
    </template>
    <em v-else>
      Connecting to socket server …
    </em>
  </v-container>
</template>

<script>
import io from 'socket.io-client'
import {Editor, EditorContent, EditorMenuBar} from 'tiptap'
import {Bold, Code, Collaboration, HardBreak, Heading, History, Italic, Underline,} from 'tiptap-extensions'
// import { TextHighlighter } from "@/plugins/textHighlighter.ts";
// import { SmilieReplacer } from "@/plugins/smileReplacer.ts";

export default {
  name: "TextEditor",
  components: {
    EditorContent,
    EditorMenuBar,
  },
  props: {
    projectPath: {
      type: String,
      required: true,
    },
    docName: {
      type: String,
      required: true,
    },
    newContext: String,
    runTimeContent: String,
    currentRole: String,
  },
  data() {
    return {
      speechLoading: false,
      selectedText: '',

      localHTML: null,
      keywords: ["however", "but", "and", "because", "whenever", "whereas", "thus", "yet"],
      lastAnchor: 0,
      lastText:"",

      loading: true,
      editor: null,
      socket: null,
      count: 0,

      synth: window.speechSynthesis,
      greetingSpeech: new window.SpeechSynthesisUtterance()
    }
  },
  watch: {
    newContext(text){
      const { size } = this.editor.view.state.doc.content
      const insertTrans = this.editor.state.tr.insertText(` ${text}`, size-1)
      this.editor.view.dispatch(insertTrans)
    },
    "editor.state.selection": function(newSelection) {
      const {from, to} = newSelection
      this.selectedText = this.editor.state.doc.textBetween(from, to, ' ')
    },
  },
  methods: {
    onInit({doc, version}) {
      this.loading = false
      if (this.editor) {
        this.editor.destroy()
      }
      this.editor = new Editor({
        content: doc,
        onUpdate:({ getHTML }) => {
          const { textContent } = this.editor.state.doc
          this.localHTML = getHTML();
          this.markKeyWord(this.editor.state.selection.anchor, textContent)
        },
        onTransaction: ({ state }) => {
          const {history$} = state
          //TODO PREVRANGES
          console.log("anchor >>>", state, history$.prevRanges)
        },
        extensions: [
          new HardBreak(),
          new Heading({levels: [1, 2, 3]}),
          new Bold(),
          new Code(),
          new Italic(),
          new Underline(),
          new History(),
          new Collaboration({
            version,
            debounce: 250,
            onSendable: ({sendable}) => {
              console.log("sendable ", sendable)
              this.socket.emit('update', sendable)
            },
          }),
        ],
      })
      console.log("EDITOR", this.editor.state.selection)
    },
    setCount(count) {
      this.count = count
    },
    listenForSpeechEvents () {
      this.greetingSpeech.onstart = () => {
        this.speechLoading = true
      }

      this.greetingSpeech.onend = () => {
        this.speechLoading = false
      }
    },
    greet () {
      this.speechLoading = true
      this.greetingSpeech.text = `${this.selectedText}`
      this.greetingSpeech.lang = "en-US";
      console.log("SP", this.greetingSpeech)
      this.synth.speak(this.greetingSpeech)
    },
    async markKeyWord(newAnchor, text) {
      console.log(newAnchor, this.lastAnchor, text, this.localHTML)
      let containKey = this.keywords.some(k => text.includes(k))

      if (newAnchor < this.lastAnchor)
        this.lastText = text

      if (text.length - this.lastText.length > 1 && text!==' ' && containKey) {
        await this.keywords.map(kw =>
            this.localHTML = this.localHTML.replace(new RegExp(kw, "g"), `<code>${kw}</code>`)
                .replace(new RegExp(`<code><code>${kw}</code></code>`, "g"), `<code>${kw}</code>`)
        )
        console.log("TRANSFORM TEXT\n", this.localHTML)

        this.editor.setContent(this.localHTML)

        const { size } = this.editor.view.state.doc.content
        const insertTrans = this.editor.state.tr.insertText(` `, size-1)
        this.editor.view.dispatch(insertTrans)
        this.lastAnchor = newAnchor
        this.lastText = text
      }
    }
  },
  mounted() {
    console.log(this.docName, this.projectPath)
    this.socket = io('http://localhost:3000/' + this.projectPath)
        .on('init', data => {
          this.onInit(data)
        })
        .on('update', data => {
          console.log("UPDATE", data)
          this.editor.extensions.options.collaboration.update(data)
        })
        // get count of connected users
        .on('getCount', count => {
          this.setCount(count)
        })
    this.socket.emit('joinRoom', this.docName)

    this.listenForSpeechEvents()
  },
  beforeDestroy() {
    this.editor.destroy()
    this.socket.destroy()
  },
}
</script>

<style>
.editor__content {
  min-height: 10rem;
  height: 100%;
  background-color: #151E27;
  color: white;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 2rem;
}

.ProseMirror-focused {
  border-color: #151E27 !important;
}

.menubar {
  line-height: 1.6em;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;
}
.menubar.is-hidden {
  visibility: hidden;
  opacity: 0;
}
.menubar.is-focused {
  visibility: visible;
  opacity: 1;
  transition: visibility 0.2s, opacity 0.2s;
}
.menubar__button {
  font-weight: bold;
  display: inline-flex;
  background: transparent;
  border: 0;
  color: #a8aab1;
  padding: 0.2rem 0.5rem;
  margin-right: 0.2rem;
  border-radius: 3px;
  cursor: pointer;
}
.menubar__button:hover {
  background-color: #3E6189;
}
.menubar__button.is-active {
  background-color: #202C37;
}
</style>
