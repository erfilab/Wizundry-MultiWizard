<template>
  <v-container>
    <template v-if="editor && !loading">
      <div class="count">
        {{ count }} {{ count === 1 ? 'user' : 'users' }} connected to {{ projectPath }}/{{ docName }}
      </div>
      <editor-content class="editor__content" :editor="editor"  />
    </template>
    <em v-else>
      Connecting to socket server …
    </em>
  </v-container>
</template>

<script>
import io from 'socket.io-client'
import { Editor, EditorContent } from 'tiptap'
import {
  HardBreak,
  Heading,
  Bold,
  Code,
  Italic,
  History,
  Collaboration,
} from 'tiptap-extensions'

export default {
  name: "testeditor",
  components: {
    EditorContent,
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
  },
  data() {
    return {
      loading: true,
      editor: null,
      socket: null,
      count: 0,
    }
  },
  methods: {
    onInit({doc, version}) {
      this.loading = false
      if (this.editor) {
        this.editor.destroy()
      }
      this.editor = new Editor({
        content: doc,
        extensions: [
          new HardBreak(),
          new Heading({levels: [1, 2, 3]}),
          new Bold(),
          new Code(),
          new Italic(),
          new History(),
          new Collaboration({
            // the initial version we start with
            // version is an integer which is incremented with every change
            version,
            // debounce changes so we can save some requests
            // debounce: 250,
            debounce: 250,
            // onSendable is called whenever there are changed we have to send to our server
            onSendable: ({sendable}) => {
              this.socket.emit('update', sendable)
            },
          }),
        ],
      })
    },
    setCount(count) {
      this.count = count
    },
  },
  mounted() {
    console.log(this.docName, this.projectPath)
    this.socket = io('http://localhost:3000/' + this.projectPath)
        // get the current document and its version
        .on('init', data => {
          console.log("INIT", data)
          this.onInit(data)
        })
        // send all updates to the collaboration extension
        .on('update', data => {
          console.log("UPDATE", data)
          this.editor.extensions.options.collaboration.update(data)
        })
        // get count of connected users
        .on('getCount', count => {
          console.log("count ", count)
          this.setCount(count)
        })
    this.socket.emit('joinRoom', this.docName)
  },
  beforeDestroy() {
    this.editor.destroy()
    this.socket.destroy()
  },
}
</script>

<style scoped>

</style>