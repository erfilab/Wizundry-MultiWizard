<template>
  <!-- wizard UI -->
  <v-container class="fill-height" v-if="this.curRole !== 'participant'">
    <v-row>
      <v-col id="chat" cols="6">
        <!-- timeline -->
        <v-card
          id="chatbox"
          elevation="0"
          class="overflow-y-auto overflow-x-hidden"
          min-height="200px"
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
                color="#757575"
                rounded
                v-if="timeLine.align === 'r'"
                min-height="55px"
                :id="'content_' + timeLine.id"
                @dblclick="recall(timeLine)"
              >
                {{ timeLine.content }}
              </v-alert>
            </v-timeline-item>
          </v-timeline>
        </v-card>
        <v-row>
          <!-- parter input -->
          <v-col cols="6">
            <h3 class="text-center">Parter's Input Box</h3>
            <v-card
              id="left_input_box"
              class="mt-3"
              color="#FFFFFF"
              rounded
              outlined
              min-height="82px"
            >
              <v-card-text class="black--text"> {{left_input}} </v-card-text>
            </v-card>
          </v-col>
          <!-- my input -->
          <v-col cols="6">
            <h3 class="text-center">Input Box</h3>
            <v-textarea
              id="right_input_box"
              class="pt-3"
              style="width: 100%"
              rows="3"
              light
              solo
              auto-grow
            />
            <v-btn
              class="float-right mt-n4 mr-4"
              elevation="2"
              color="#7CB342"
              @click="sendMsg()"
            >
              Send
            </v-btn>
            <h3 class="text-center mt-10">Privacy Input Box</h3>
            <v-textarea
              id="temp_input_box"
              class="pt-3"
              style="width: 100%"
              rows="3"
              light
              solo
              auto-grow
            />
            <v-btn
              class="float-right mt-n4 mr-4"
              elevation="2"
              color="#7CB342"
              @click="sendTempMsg()"
            >
              Send
            </v-btn>
          </v-col>
        </v-row>
        <!-- test input area -->
        <br><br>
        <h3 class="text-center">User (for test)</h3>
        <v-textarea
          label="Message"
          v-model="message"
          outlined
          no-resize
          class="overflow-y-auto overflow-x-hidden pt-1"
          height="100px"
        >
        </v-textarea>
        <v-btn
          class="float-right mt-n4 ml-4 mr-2"
          elevation="2"
          color="#7CB342"
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
            <v-icon
              class="ml-4 mt-2"
              color="#5DBAB9"
              style="height:30px"
            >
              mdi-account
            </v-icon>
            <v-textarea
              class="mt-2 mr-6 mb-n4"
              rows="1"
              outlined
              auto-grow
              value="1. decide the final output content"
            />
          </v-row>
          <v-row>
            <v-icon
              class="ml-4"
              color="#CC6E6E"
              style="height:30px"
            >
              mdi-account
            </v-icon>
            <v-textarea
              class="mr-6"
              rows="1"
              outlined
              auto-grow
              value="1. take the charge of the microphone (open/close)"
            />
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
                  color="#FFFFFF"
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
              height="460px"
            >
              <v-textarea
                v-for="reply in allReplies"
                :key="reply.id"
                solo
                class="ml-4 mr-4 mt-4 mb-n8"
                backgroundColor="#7CB342"
                rows="1"
                auto-grow
                :value = reply.content
                @dblclick="sendReply"
                clearable
              />
            </v-card>
            <br>
            <!-- Points -->
            <!-- <v-row>
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
                  color="#FFFFFF"
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
              height="210px"
            >
              <v-alert
                v-for="point in allPoints"
                :key="point.id"
                elevation="2"
                class="ma-4"
                color="#757575"
                rounded
                @dblclick="sendPoint"
              >
                {{ point.content }}
              </v-alert>
            </v-card> -->
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
              id="loggerbox"
              outlined
              class="overflow-y-auto overflow-x-hidden mt-3"
              height="250px"
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
              class="overflow-y-auto overflow-x-hidden pt-3"
              height="210px"
            >
            </v-textarea>
            <v-btn
              class="float-right mt-n4 ml-2 mr-4"
              elevation="2"
              color="#7CB342"
              @click="sendLogMsg()"
            >
              Send
            </v-btn>
            <v-btn
              class="float-right mt-n4 ml-2 mr-4"
              elevation="2"
              color="#7CB342"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <!-- participant UI -->
  <v-container class="fill-height" v-else>
    <!-- timeline -->
    <v-row>
      <v-spacer/>
      <v-col id="chat" cols="8">
        <v-card
          id="chatbox"
          elevation="0"
          class="overflow-y-auto overflow-x-hidden"
          min-height="200px"
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
                color="#757575"
                rounded
                v-if="timeLine.align === 'r'"
                min-height="55px"
                :id="'content_' + timeLine.id"
              >
                {{ timeLine.content }}
              </v-alert>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
      <v-spacer/>
    </v-row>
    <!-- mic bar -->
    <v-row>
      <v-spacer/>
      <v-col cols="1">
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
      <v-col col="1" class="pt-5 mt-2">
        <span> {{ isSpeaking ? "speaking..." : "closed" }} </span>
        <v-progress-linear
            style="width:70%"
            :color="
            !isSpeaking ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'
          "
            :indeterminate="isSpeaking"
        />
      </v-col>
      <v-spacer/>
    </v-row>
    <!-- Direction -->
    <v-row>
      <v-spacer/>
      <v-col cols="6">
        <v-row>
          <h2 class="ml-4 mt-6">Direction</h2>
        </v-row>
        <v-row>
          <div class="ml-4 mt-2">
            XXX
          </div>
        </v-row>
      </v-col>
      <v-spacer/>
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters} from "vuex";
import io from "socket.io-client";

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
  components: {},
  data() {
    return {
      message: "",
      logger_message: "",
      left_input: "",
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
      let action = " opened ";
      if (!e) {
        action = " closed "
      }
      let newLog = {
        content: this.currentUser + action + "the microphone",
      };
      this.allLogs.push(newLog);
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
    scrollToLoggerBoxBottom() {
      const container = this.$el.querySelector("#loggerbox");
      container.scrollTop = container.scrollHeight;
    },
    addReply() {
      this.allReplies.push({
        content: "",
      });
      this.scrollToReplyBoxBottom();
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
      let el = (event.target || event.srcElement);
      let newTimeLine = {
        id: this.allTimeLines.length
            ? this.allTimeLines.length
            : 0,
        content: el.value,
        align: "r",
        playing: false,
        played: false
      };
      this.allTimeLines.push(newTimeLine);
      let newLog = {
        content: this.currentUser + " sent a quick reply: \"" + el.value + "\"",
      };
      this.allLogs.push(newLog);
      this.scrollToLoggerBoxBottom();
    },
    sendPoint(event) {
      let el = (event.target || event.srcElement);
      let newTimeLine = {
        id: this.allTimeLines.length
            ? this.allTimeLines.length
            : 0,
        content: el.textContent,
        align: "r",
        playing: false,
        played: false
      };
      this.allTimeLines.push(newTimeLine);
      this.deletePoint(el.textContent);
      let newLog = {
        content: this.currentUser + " sent a point: \"" + el.textContent + "\"",
      };
      this.allLogs.push(newLog);
      this.scrollToLoggerBoxBottom();
    },
    deletePoint(msg) {
      for (let i = 0; i < this.allPoints.length; i++) {
        if (this.allPoints[i].content.trim() === msg.trim()) {
          this.allPoints.splice(i, 1);
          break;
        }
      }
    },
    sendLogMsg() {
      if (this.logger_message !== "") {
        let newLog = {
          content: this.currentUser + ": " + this.logger_message,
        };
        this.allLogs.push(newLog);
        this.scrollToLoggerBoxBottom();
        this.logger_message = "";
      }
    },
    sendUserMsg() {
      if (this.message !== "") {
        let newTimeLine = {
          id: this.allTimeLines.length
              ? this.allTimeLines.length
              : 0,
          content: this.message,
          align: "l",
          playing: false,
          played: false
        };
        this.allTimeLines.push(newTimeLine);
        this.message = "";
      }
    },
    sendMsg() {
      let element = this.$el.querySelector("#right_input_box");
      if (element.value !== "") {
        var newTimeLine = {
          id: this.allTimeLines.length
              ? this.allTimeLines.length
              : 0,
          content: element.value,
          align: "r",
          playing: false,
          played: false
        }
        this.allTimeLines.push(newTimeLine);
        element.value = "";
        let newLog = {
          content: this.currentUser + " sent a message",
        };
        this.allLogs.push(newLog);
        this.scrollToLoggerBoxBottom();
      }
    },
    sendTempMsg() {
      let element = this.$el.querySelector("#temp_input_box");
      if (element.value !== "") {
        var newTimeLine = {
          id: this.allTimeLines.length
              ? this.allTimeLines.length
              : 0,
          content: element.value,
          align: "r",
          playing: false,
          played: false
        }
        this.allTimeLines.push(newTimeLine);
        element.value = "";
        let newLog = {
          content: this.currentUser + " sent a message",
        };
        this.allLogs.push(newLog);
        this.scrollToLoggerBoxBottom();
      }
    },
    recall(timeLine) {
      if (!timeLine.played && !timeLine.playing) {
        let element = this.$el.querySelector("#temp_input_box");
        element.value = timeLine.content;
        this.allTimeLines.splice(timeLine.id, 1);
        for (let i = 0; i < this.allTimeLines.length; i++) {
          this.allTimeLines[i].id = i;
        }
      }
    },
  },
  created() {
    this.allReplies.push({
      content: "Okay, I got it.",
    });
    this.allReplies.push({
      content: "Sorry, please speak again.",
    });
    this.allReplies.push({
      content: "",
    });
    // this.allPoints.push({
    //   content: "Point 1",
    // });
    // this.allPoints.push({
    //   content: "Point 2",
    // });
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

