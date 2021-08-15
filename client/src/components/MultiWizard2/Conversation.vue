<template>
  <v-container class="fill-height">
    <v-row>
      <v-col id="chat" cols="6">
        <!-- timeline -->
        <v-card
            id="chatbox"
            elevation="0"
            class="overflow-y-auto overflow-x-hidden"
            max-height="800px"
        >
          <v-row>
            <v-col>
              <h3 class="text-center">User</h3>
            </v-col>
            <v-col>
              <h3 class="text-center">Wizard</h3>
            </v-col>
          </v-row>
          <v-timeline class="ma-4">
            <v-timeline-item
                v-for="timeLine in allTimeLines"
                :key="timeLine.id"
                class="text-left"
                hide-dot
                :left="timeLine.align === 'l'"
                :right="timeLine.align === 'r'"
            >
              <v-alert
                  elevation="2"
                  outlined
                  rounded
                  v-if="timeLine.align === 'l'"
              >
                {{ timeLine.content }}
              </v-alert>
              <v-alert
                  elevation="2"
                  color="#E5E4DF"
                  rounded
                  v-if="timeLine.align === 'r' && timeLine.sent"
                  min-height="55px"
                  :id="'content_' + timeLine.id"
              >
                {{ timeLine.content }}
              </v-alert>
              <v-textarea
                  solo
                  backgroundColor="#E5E4DF"
                  counter
                  v-if="timeLine.align === 'r' && !timeLine.sent"
                  :id="'content_' + timeLine.id"
                  :value=timeLine.content
              >
              </v-textarea>
              <TextEditor
                  :id="'text_' + timeLine.id"
                  v-if="timeLine.align === 'r' && !timeLine.sent"
                  :currentUser="currentUser"
                  @sent="sendText"
              />
            </v-timeline-item>
          </v-timeline>
        </v-card>
        <br><br>
        <h3 class="text-center">User (for test)</h3>
        <v-textarea
            label="Message"
            v-model="message"
            outlined
            no-resize
            counter
            class="overflow-y-auto overflow-x-hidden pt-1"
            height="350px"
        >
        </v-textarea>
        <v-btn
            class="ml-4 mr-2"
            elevation="2"
            color="#CDE589"
            @click="sendUserMsg()"
        >
          Send
        </v-btn>
      </v-col>
      <v-col col="6">
        <!-- Direction -->
        <div>
          <v-row>
            <h2 class="ml-4 mt-2">Direction</h2>
          </v-row>
          <v-row>
            <div class="ml-4 mt-2">In this scenario, you need to respond user’s questions.
              Fortunately, Speech recognition tool is available while microphone
              is opening. It will avoid the problem of your forgetting. There some tasks
              for you and your partner:
            </div>
          </v-row>
          <v-row>
            <div class="ml-4 font-italic font-weight-bold">you should make a devision with your partner</div>
          </v-row>
          <v-row>
            <v-icon class="ml-4" color="#5DBAB9">mdi-account</v-icon>
            <div>a) decide the final output content and press PLAY</div>
          </v-row>
          <v-row>
            <v-icon class="ml-4" color="#5DBAB9">mdi-account</v-icon>
            <div>b) XXX</div>
          </v-row>
          <v-row>
            <v-icon class="ml-4" color="#CC6E6E">mdi-account</v-icon>
            <div>c) take the charge of the microphone (open/close)</div>
          </v-row>
          <v-row>
            <v-icon class="ml-4" color="#CC6E6E">mdi-account</v-icon>
            <div>d) XXX</div>
          </v-row>
        </div>
        <!-- contain four boxes -->
        <v-row>
          <!-- left -->
          <v-col id="box" cols="6">
            <!-- Quick Replies -->
            <v-row>
              <v-col cols="8">
                <h3 class="text-center mt-1">Quick Replies</h3>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn
                    class="fab mx-2"
                    icon
                    outlined
                    dark
                    x-samll
                    color="#000000"
                    @click="addReply"
                >
                  <v-icon dark> mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-card
                id="replybox"
                outlined
                class="overflow-y-auto overflow-x-hidden mt-2"
                height="280px"
            >
              <v-alert
                  v-for="reply in allReplies"
                  :key="reply.id"
                  elevation="2"
                  class="ma-4"
                  color="#CDE589"
                  rounded
                  @dblclick="sendReply"
              >
                {{ reply.content }}
              </v-alert>
            </v-card>
            <br>
            <!-- Points -->
            <v-row>
              <v-col cols="8">
                <h3 class="text-center mt-1">Points</h3>
              </v-col>
              <v-spacer></v-spacer>
              <v-col>
                <v-btn
                    class="fab mx-2"
                    icon
                    outlined
                    dark
                    x-samll
                    color="#000000"
                    @click="addPoint"
                >
                  <v-icon dark> mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-card
                id="pointbox"
                outlined
                class="overflow-y-auto overflow-x-hidden mt-2"
                height="280px"
            >
              <v-alert
                  v-for="point in allPoints"
                  :key="point.id"
                  elevation="2"
                  class="ma-4"
                  color="#E5E4DF"
                  rounded
                  @dblclick="sendPoint"
              >
                {{ point.content }}
              </v-alert>
            </v-card>
            <!-- mic bar -->
            <v-row>
              <v-col cols="3">
                <v-btn
                    @click="
                    isSpeaking ? emitSpeakerEvent(false) : emitSpeakerEvent(true)
                  "
                    fab
                    :color="
                    !isSpeaking ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'
                  "
                    class="mt-4"
                >
                  <v-icon
                  >{{ isSpeaking ? "mdi-microphone-off" : "mdi-microphone" }}
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col class="pt-5 mt-2">
                <span> {{ isSpeaking ? "speaking..." : "closed" }} </span>
                <v-progress-linear
                    :color="
                    !isSpeaking ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'
                  "
                    :indeterminate="isSpeaking"
                />
              </v-col>
            </v-row>
          </v-col>
          <!-- right -->
          <v-col id="others" cols="6">
            <h3 class="text-center mt-1">Logger</h3>
            <v-card
                outlined
                class="overflow-y-auto overflow-x-hidden mt-3"
                height="280px"
            >
              <div
                  v-for="wizardLog in allLogs"
                  :key="wizardLog.id"
              >
                {{ wizardLog.content }}
              </div>
            </v-card>
            <br>
            <h3 class="text-center mt-1">WhiteBoard</h3>
            <v-textarea
                label="Notes"
                v-model="logger_message"
                outlined
                no-resize
                counter
                class="overflow-y-auto overflow-x-hidden pt-3"
                height="280px"
            >
            </v-textarea>
            <v-btn
                class="ml-2 mr-4"
                elevation="2"
                color="#CDE589"
            >
              Save
            </v-btn>
            <v-btn
                class="ml-4 mr-2"
                elevation="2"
                color="#CDE589"
                @click="sendLogMsg()"
            >
              Send
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters} from "vuex";
import io from "socket.io-client";
import TextEditor from "./TextEditor";

const BUFFER_SIZE = 2048;
const MEDIA_ACCESS_CONSTRAINTS = {audio: true, video: false};
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

export default {
  name: "Conversation",
  components: {
    TextEditor
  },
  data() {
    return {
      message: "",
      logger_message: "",
      allTimeLines: [],
      allReplies: [],
      allPoints: [],
      allLogs: [],

      currentUser: {},


      socket: null,

      //web recording
      isSpeaking: false,
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
    allTimeLines: {
      handler() {
        if (this.allTimeLines[this.allTimeLines.length - 1].sent) {
          this.allTimeLines.push({
            id: this.allTimeLines.length
                ? this.allTimeLines[this.allTimeLines.length - 1].id + 1
                : 0,
            content: "",
            align: "r",
            sent: false
          });
        }
        this.scrollToChatBoxBottom();
      },
      deep: true,
    },
    getCurrentUser(newVal) {
      if (newVal) {
        console.log("Current USER >> ", newVal);
        this.initProject();
      }
    },
    newContent(text) {
      this.message = text
    },
    runTimeContent(newVal, oldVal) {
      console.log('Run time Content', newVal, oldVal)
    },
  },
  methods: {
    getRandomColor() {
      const list = [
        "#958DF1",
        "#F98181",
        "#FBBC88",
        "#FAF594",
        "#70CFF8",
        "#94FADB",
        "#B9F18D",
      ]
      return list[Math.floor(Math.random() * list.length)]
    },
    initProject() {
      this.currentUser = this.getCurrentUser;
      this.currentUser.color = this.getRandomColor();

      let HOST =
          process.env.NODE_ENV === "production"
              ? "https://ryanyen2.tech/"
              : "http://localhost:3000/";
      this.socket = io(HOST + new Date().toISOString().slice(0, 10))
          .on("WEB_RECORDING", async (e) => {
            console.log("WEB RECORDING STATUS: ", e);
            if (e && this.curRole === "participant" && this.isSpeaking === false) {
              this.initRecording();
            } else if (
                !e &&
                this.curRole === "participant" &&
                this.isSpeaking === true
            ) {
              this.endRecording();
            }
          })
          .on("SPEECH_DATA", async (param) => {
            let {data, uid} = param;
            if (
                data &&
                this.curRole === "participant" &&
                this.isSpeaking &&
                this.currentUser.uid === uid
            ) {
              this.runTimeContent = data.results[0].alternatives[0].transcript;

              const dataFinal = data.results[0].isFinal;

              if (dataFinal && this.runTimeContent) {
                let temp_cont = this.runTimeContent;
                this.runTimeContent = "";
                this.newContent = temp_cont;
                console.log('New Content from User: ', this.newContent)
              }
            }
          });
      this.socket.emit("joinRoom", "default");
    },
    // microphone event
    emitSpeakerEvent(e) {
      this.isSpeaking = e;
      this.socket.emit("MICROPHONE", {
        status: e,
        punctuation: true,
      });
    },
    // speech recognition function
    initRecording() {
      this.isSpeaking = true;
      this.socket.emit("startGoogleCloudStream", this.currentUser.uid);
      this.audioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new this.audioContext({ latencyHint: "interactive" });
      this.processor = this.context.createScriptProcessor(BUFFER_SIZE, 1, 1);
      this.processor.connect(this.context.destination);
      if (this.context.state !== 'running')
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
      this.isSpeaking = false;
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
    // others function
    scrollToChatBoxBottom() {
      const container = this.$el.querySelector("#chatbox");
      container.scrollTop = container.scrollHeight;
    },
    scrollToReplyBoxBottom() {
      const container = this.$el.querySelector("#replybox");
      container.scrollTop = container.scrollHeight;
    },
    scrollToPointBoxBottom() {
      const container = this.$el.querySelector("#pointbox");
      container.scrollTop = container.scrollHeight;
    },
    addReply() {
      let word = prompt("Add a new quick reply:");
      if (word) {
        this.allReplies.push({
          content: word,
        });
        this.scrollToReplyBoxBottom();
      }
    },
    addPoint() {
      let word = prompt("Add a new point:");
      if (word) {
        this.allPoints.push({
          content: word,
        });
        this.scrollToPointBoxBottom();
      }
    },
    sendReply(event) {
      let el = (event.target || event.srcElement)
      let last = this.allTimeLines[this.allTimeLines.length - 1];
      this.updateInput(last.id);
      if (
          this.allTimeLines.length &&
          last.align === "r" &&
          last.content === ""
      ) {
        this.allTimeLines.pop();
      }
      let index = this.allTimeLines.length ? this.allTimeLines.length - 1 : 0;
      while (index > 0 && !this.allTimeLines[index].sent) {
        this.allTimeLines[index].id += 1;
        index -= 1;
      }
      let newTimeLine = {
        id: this.allTimeLines.length
            ? index + 1
            : 0,
        content: el.textContent,
        align: "r",
        sent: true
      };
      this.allTimeLines.splice(index + 1, 0, newTimeLine);
    },
    sendPoint(event) {
      let el = (event.target || event.srcElement)
      let last = this.allTimeLines[this.allTimeLines.length - 1];
      this.updateInput(last.id);
      if (
          this.allTimeLines.length &&
          last.align === "r" &&
          last.content === ""
      ) {
        this.allTimeLines.pop();
      }
      let index = this.allTimeLines.length ? this.allTimeLines.length - 1 : 0;
      while (index > 0 && !this.allTimeLines[index].sent) {
        this.allTimeLines[index].id += 1;
        index -= 1;
      }
      let newTimeLine = {
        id: this.allTimeLines.length
            ? index + 1
            : 0,
        content: el.textContent,
        align: "r",
        sent: true
      };
      this.allTimeLines.splice(index + 1, 0, newTimeLine);
      this.deletePoint(el.textContent);
    },
    deletePoint(msg) {
      for (let i = 0; i < this.allPoints.length; i++) {
        if (this.allPoints[i].content.trim() === msg.trim()) {
          this.allPoints.splice(i, 1);
          break;
        }
      }
    },
    updateInput(id) {
      if (!this.allTimeLines[id].sent) {
        this.allTimeLines[id].content = document.getElementById(`content_${this.allTimeLines[this.allTimeLines.length - 1].id}`).value;
      }
    },
    sendLogMsg() {
      if (this.logger_message !== "") {
        let newLog = {
          content: this.logger_message,
        };
        this.allLogs.push(newLog);
        this.logger_message = "";
      }
    },
    sendUserMsg() {
      if (this.message !== "") {
        this.updateInput(this.allTimeLines.length - 1);
        if (
            this.allTimeLines.length &&
            this.allTimeLines[this.allTimeLines.length - 1].align === "r" &&
            this.allTimeLines[this.allTimeLines.length - 1].content === ""
        ) {
          this.allTimeLines.pop();
        }
        let index = this.allTimeLines.length ? this.allTimeLines.length - 1 : 0;
        while (index > 0 && !this.allTimeLines[index].sent) {
          this.allTimeLines[index].id += 1;
          index -= 1;
        }
        let newTimeLine = {
          id: this.allTimeLines.length
              ? index + 1
              : 0,
          content: this.message,
          align: "l",
          sent: true
        };
        this.allTimeLines.splice(index + 1, 0, newTimeLine);
        this.message = "";
      }
    },
    play() {
      let last = this.allTimeLines[this.allTimeLines.length - 1];
      if (last.align === "r" && !last.sent) {
        this.updateInput(last.id);
        last.sent = true;
      }
    },
    sendText(newText) {
      console.log('New Text From Wizard: ', newText)
      //TODO add new text to the timeline
    }
  },
  created() {
    if (this.allTimeLines.length === 0) {
      this.allTimeLines.push({
        id: this.allTimeLines.length
            ? this.allTimeLines[this.allTimeLines.length - 1].id + 1
            : 0,
        content: "",
        align: "r",
        sent: false
      });
    }
    this.allReplies.push({
      content: "Okay, I got it.",
    });
    this.allReplies.push({
      content: "Sorry, please speak again.",
    });
    this.allPoints.push({
      content: "Point 1",
    });
    this.allPoints.push({
      content: "Point 2",
    });
  },
  mounted() {

  },
};
</script>

<style scoped>
#user_input {
  width: 100px;
}
</style>

