<template>
  <v-container>
    <div class="text-area" v-if="currentRole === 'experimenter'">
      <v-row>
      </v-row>


    </div>
    <v-tabs>
      <v-tab>Paragraph One</v-tab>
      <v-tab>Paragraph Two</v-tab>
      <v-tab>Paragraph Three</v-tab>
      <v-spacer />
      <v-sheet v-if="currentRole === 'experimenter'">
        <v-row>
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
        </v-row>
      </v-sheet>
      <v-tab-item>
        <div class="editor-area">
          <TextEditor
              projectPath="project1"
              docName="doc2"
              :newContext="newContext"
              :runTimeContent="runTimeContent"
              :currentRole="currentRole"
          />
        </div>
      </v-tab-item>
      <v-tab-item>
        <div class="editor-area">
          <TextEditor
              projectPath="project2"
              docName="doc1"
              :newContext="newContext"
              :runTimeContent="runTimeContent"
              :currentRole="currentRole"
          />
        </div>
      </v-tab-item>
    </v-tabs>


  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'
import TextEditor from './TextEditor.vue'

export default {
  name: "TextArea",
  components: {
    TextEditor,
  },
  data() {
    return {
      // speech to text
      isTesting: false,

      isSpeaking: false,
      recognition: null,

      newContext: "",
      runTimeContent: "",

      autoHighlight: true,
      autoPunctuation: false,
    }
  },
  methods: {
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
          this.newContext = this.runTimeContent
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
    async preProcessContent() {
      // TODO: PUNCTUATION
      // if (process.env.NODE_ENV === 'production') {
      //    let headers = { 'Access-Control-Allow-Origin': '*' }
      //   await this.$http.post('http://bark.phon.ioc.ee/punctuator',
      //     { "text": htmlVal }, {headers})
      //     .then(res => this.content = res.data)
      // }
    }
  },
  computed: {
    ...mapGetters('auth', ['getCurrentUser']),
    currentRole() {
      console.log(this.getCurrentUser)
      return this.getCurrentUser.role
    }
  },
  mounted() {
    console.log(process.env)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
  },
}
</script>

<style lang="css">
</style>
