<template>
  <!-- wizard UI -->
  <v-container
    v-if="this.curRole !== 'participant'"
    class="fill-height"
  >
    <v-row>
      <v-col
        id="chat"
        cols="6"
      >
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
              <h3 class="text-center">
                User
              </h3>
            </v-col>
            <v-col>
              <h3 class="text-center">
                Wizard
              </h3>
            </v-col>
          </v-row>
          <v-timeline class="ma-4">
            <v-timeline-item
              v-for="timeLine in allTimeLines"
              :key="timeLine.id"
              class="text-left"
              hide-dot
              :left="timeLine.align === 'l'"
              :right="timeLine.align.charAt(0) === 'r'"
            >
              <v-alert
                v-if="timeLine.align === 'l'"
                elevation="2"
                outlined
                rounded
              >
                {{ timeLine.content }}
              </v-alert>
              <v-alert
                v-if="timeLine.align.charAt(0) === 'r'"
                :id="'content_' + timeLine.id"
                :class="`alert__playing--${timeLine.playing ? 'yes' : 'no'}`"
                elevation="2"
                color="#757575"
                rounded
                min-height="55px"
                @dblclick="recall(timeLine)"
              >
                {{ timeLine.content }}
                <div>
                  <div :class="`alert__status alert__status--${timeLine.align.charAt(1)}`" />
                </div>
              </v-alert>
            </v-timeline-item>
          </v-timeline>
        </v-card>
        <v-row>
          <v-col cols="6">
            <h3 class="text-center">
              Wizard1 Input Box
            </h3>
            <text-editor
              v-if="currentUser.uid"
              id="left_input_box"
              style="width: 100%"
              class="pt-3"
              :role="1"
              :current-user="currentUser"
              @wizardSendMsg="sendMsg"
            />
          </v-col>
          <v-col cols="6">
            <h3 class="text-center">
              Wizard2 Input Box
            </h3>
            <text-editor
              v-if="currentUser.uid"
              id="right_input_box"
              style="width: 100%"
              class="pt-3"
              :role="2"
              :current-user="currentUser"
              @wizardSendMsg="sendMsg"
            />
            <h3 class="text-center mt-10">
              Privacy Input Box
            </h3>
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
              @click="sendTempMsg"
            >
              Send
            </v-btn>
          </v-col>
        </v-row>
        <!-- test input area -->
        <h3 class="text-center mt-5">
          User (for test)
        </h3>
        <v-textarea
          v-model="message"
          label="Message"
          outlined
          no-resize
          class="overflow-y-auto overflow-x-hidden pt-1"
          height="100px"
        />
        <v-btn
          class="float-right mt-n4 ml-4 mr-2"
          elevation="2"
          color="#7CB342"
          @click="sendUserMsg"
        >
          Send
        </v-btn>
      </v-col>
      <v-col class="col">
        <tips-dialog v-model="showTipsDialog" />
        <!-- contain four boxes -->
        <v-row>
          <!-- left -->
          <v-col
            id="box"
            cols="6"
          >
            <!-- Quick Replies -->
            <v-row>
              <v-col cols="8">
                <h3 class="text-center mt-1">
                  Quick Replies
                </h3>
              </v-col>
              <v-spacer />
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
                  <v-icon dark>
                    mdi-plus
                  </v-icon>
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
                background-color="#7CB342"
                rows="1"
                auto-grow
                :value="reply.content"
                clearable
                @dblclick="sendReply"
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
                  fab
                  :color="
                    !isSpeaking ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'
                  "
                  class="mt-4"
                  @click="
                    isSpeaking
                      ? emitSpeakerEvent(false)
                      : emitSpeakerEvent(true)
                  "
                >
                  <v-icon>
                    {{ isSpeaking ? "mdi-microphone-off" : "mdi-microphone" }}
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
          <v-col
            id="others"
            cols="6"
          >
            <h3 class="text-center mt-1">
              Logger
            </h3>
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
            <h3 class="text-center mt-1">
              WhiteBoard
            </h3>
            <v-textarea
              v-model="logger_message"
              label="Notes"
              outlined
              no-resize
              class="overflow-y-auto overflow-x-hidden pt-3"
              height="210px"
            />
            <v-btn
              class="float-right mt-n4 ml-2 mr-4"
              elevation="2"
              color="#7CB342"
              @click="sendLogMsg"
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
  <v-container
    v-else
    class="fill-height"
  >
    <!-- timeline -->
    <v-row>
      <v-spacer />
      <v-col
        id="chat"
        cols="8"
      >
        <v-card
          id="chatbox"
          elevation="0"
          class="overflow-y-auto overflow-x-hidden"
          min-height="200px"
          max-height="800px"
        >
          <v-row>
            <v-col>
              <h3 class="text-center">
                User
              </h3>
            </v-col>
            <v-col>
              <h3 class="text-center">
                Wizard
              </h3>
            </v-col>
          </v-row>
          <v-timeline class="ma-4">
            <v-timeline-item
              v-for="timeLine in allTimeLines"
              :key="timeLine.id"
              class="text-left"
              hide-dot
              :left="timeLine.align === 'l'"
              :right="timeLine.align.charAt(0) === 'r'"
            >
              <v-alert
                v-if="timeLine.align === 'l'"
                elevation="2"
                outlined
                rounded
              >
                {{ timeLine.content }}
              </v-alert>
              <v-alert
                v-if="timeLine.align.charAt(0) === 'r'"
                :id="'content_' + timeLine.id"
                elevation="2"
                color="#757575"
                rounded
                min-height="55px"
              >
                {{ timeLine.content }}
                <div>
                  <div :class="`alert__status alert__status--${timeLine.align.charAt(1)}`" />
                </div>
              </v-alert>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
      <v-spacer />
    </v-row>
    <!-- mic bar -->
    <v-row>
      <v-spacer />
      <v-col cols="1">
        <v-btn
          fab
          :color="!isSpeaking ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'"
          class="mt-4"
          @click="isSpeaking ? emitSpeakerEvent(false) : emitSpeakerEvent(true)"
        >
          <v-icon>
            {{ isSpeaking ? "mdi-microphone-off" : "mdi-microphone" }}
          </v-icon>
        </v-btn>
      </v-col>
      <v-col class="pt-5 mt-2 col">
        <span> {{ isSpeaking ? "speaking..." : "closed" }} </span>
        <v-progress-linear
          style="width:70%"
          :color="!isSpeaking ? 'grey' : isSpeaking ? 'cyan' : 'cyan darken-3'"
          :indeterminate="isSpeaking"
        />
      </v-col>
      <v-spacer />
    </v-row>
    <!-- Direction -->
    <v-row>
      <v-spacer />
      <v-col cols="6">
        <v-row>
          <h2 class="ml-4 mt-6">
            Direction
          </h2>
        </v-row>
        <v-row>
          <div class="ml-4 mt-2">
            XXX
          </div>
        </v-row>
      </v-col>
      <v-spacer />
    </v-row>
    <!-- test input area -->
    <v-row>
      <v-spacer />
      <v-col cols="6">
        <v-row>
          <h3 class="text-center ml-4 mt-6">
            User (for test)
          </h3>
        </v-row>
        <v-row>
          <v-textarea
            v-model="message"
            label="Message"
            outlined
            no-resize
            class="overflow-y-auto overflow-x-hidden ml-4 pt-1"
            height="100px"
          />
        </v-row>
        <v-row>
          <v-btn
            class="float-right mt-n4 ml-6 mr-2"
            elevation="2"
            color="#7CB342"
            @click="sendUserMsg"
          >
            Send
          </v-btn>
        </v-row>
      </v-col>
      <v-spacer />
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
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

import TipsDialog from "./TipsDialog.vue";
import TextEditor from "./TextEditor.vue";

export default {
  name: "Conversation",
  components: {
    TipsDialog,
    TextEditor,
  },
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
      showTipsDialog: true,

      socket: null,

      // web speech
      speechLoading: false,
      synth: window.speechSynthesis,
      audioSpeech: new window.SpeechSynthesisUtterance(),

      //web recording
      isSpeaking: false,
      audioContext: null,
      context: null,
      processor: null,
      globalStream: null,
      audioInput: null,

      runTimeContent: "",
      newContent: "",

      // commands
      commandFromOthers: [],
    };
  },
  computed: {
    ...mapGetters("user", ["getCurrentUser"]),
    curRole() {
      return this.currentUser.role;
      // participant
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
      this.message = text;
    },
    runTimeContent(newVal, oldVal) {
      console.log("Run time Content", newVal, oldVal);
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
  mounted() {},
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
      ];
      return list[Math.floor(Math.random() * list.length)];
    },
    initProject() {
      this.currentUser = this.getCurrentUser;
      this.currentUser.color = this.getRandomColor();
      this.listenForSpeechEvents();
      let HOST =
        process.env.NODE_ENV === "production"
          ? "https://ryanyen2.tech/"
          : "http://localhost:3000/";
      this.socket = io(HOST + new Date().toISOString().slice(0, 10))
        .on("WEB_RECORDING", async (e) => {
          console.log("WEB RECORDING STATUS: ", e);
          if (
            e &&
            this.curRole === "participant" &&
            this.isSpeaking === false
          ) {
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
          let { data, uid } = param;
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

              console.log("New Content from User: ", this.newContent);
            }
          }
        })
        .on("PLAY_MESSAGE", async (param) => {
          let { id, content } = param;
          if (content) {
            await this.allTimeLines.map(async (timeItem) => {
              if (timeItem.id === id && !timeItem.played) {
                console.log("PLAY MESSAGE: ", timeItem);
                timeItem.playing = true;
                await this.speakBack(content)
                timeItem.playing = false;
                timeItem.played = true;
              }
            });
          }
        })
        .on("MESSAGE", async (data) => {
          if (data.content) {
            const receivedTime = this.dayjs().format("MM-DD HH:mm:ss");
            switch (data.align) {
            case "r1":
            case "r2":
              console.log(
                `Wizard Message ${data.content} , from ${data.uid} `
              );
              this.allTimeLines.push({ ...data });
              this.allLogs.push({
                content: `Wizard ${data.uid} sent a message at ${receivedTime}`,
              });
              break;
            case "rq":
              console.log(
                `Wizard Quick Reply ${data.content} , from ${data.uid} `
              );
              this.allTimeLines.push({ ...data, align: "r" });
              this.allLogs.push({
                content: `Wizard ${data.uid} sent a quick reply at ${receivedTime}`,
              });
              break;
            case "l":
              console.log(
                `Participant Message ${data.content} , from ${data.uid} `
              );
              this.allTimeLines.push({ ...data });
              this.allLogs.push({
                content: `Participant sent a message at ${receivedTime}`,
              });
              break;
            case "n":
              console.log(`Logger logs ${data.content} , from ${data.uid} `);
              this.allLogs.push({
                content: `Wizard ${data.uid} sent a log at ${receivedTime}\ncontent: ${data.content}`,
              });
              break;
            default:
              console.log(
                `Unknown Message ${data.content} , from ${data.uid} `
              );
              this.allLogs.push({
                content: `Unknown Message at ${this.dayjs().format(
                  "MM-DD HH:mm:ss"
                )}`,
              });
              break;
            }
            await this.playAll();
          }
        });
      this.socket.emit("joinRoom", "default");
    },
    // speaker event
    listenForSpeechEvents() {
      this.audioSpeech.onstart = () => {
        this.speechLoading = true;
      };

      this.audioSpeech.onend = () => {
        this.speechLoading = false;
      };
    },
    speakBack(content) {
      this.audioSpeech.text = content;
      this.audioSpeech.lang = "en-US";
      this.synth.speak(this.audioSpeech);
    },
    // microphone event
    emitSpeakerEvent(e) {
      this.isSpeaking = e;

      this.allLogs.push({
        content: `Wizard ${this.currentUser.uid} ${
          e ? "opened" : "closed"
        } the microphone at ${this.dayjs().format("MM-DD HH:mm:ss")}`,
      });
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
      if (this.context.state !== "running") this.context.resume();

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
      let el = event.target || event.srcElement;
      if (el && el.value) {
        this.socket.emit("sendMessage", {
          uid: this.currentUser.uid,
          content: el.value,
          align: "rq",
          id: this.allTimeLines.length ? this.allTimeLines.length : 0,
          playing: false,
          played: false,
        });
        el.value = "";
        this.scrollToLoggerBoxBottom();
      }
    },
    sendPoint(event) {
      let el = event.target || event.srcElement;
      let newTimeLine = {
        id: this.allTimeLines.length ? this.allTimeLines.length : 0,
        content: el.textContent,
        align: "r",
        playing: false,
        played: false,
      };
      this.allTimeLines.push(newTimeLine);
      this.deletePoint(el.textContent);
      let newLog = {
        content: this.currentUser + ' sent a point: "' + el.textContent + '"',
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
      if (this.logger_message) {
        this.socket.emit("sendMessage", {
          content: this.logger_message,
          uid: this.currentUser.uid,
          align: "n",
        });
        this.scrollToLoggerBoxBottom();
        this.logger_message = "";
      }
    },
    sendUserMsg() {
      if (this.message) {
        this.socket.emit("sendMessage", {
          id: this.allTimeLines.length ? this.allTimeLines.length : 0,
          content: this.message,
          uid: this.currentUser.uid,
          align: "l",
          playing: false,
          played: false,
        });

        this.message = "";
      }
    },
    async sendMsg(param) {
      // let element = this.$el.querySelector("#right_input_box");
      const { role, content } = param;
      if (content) {
        this.socket.emit("sendMessage", {
          uid: this.currentUser.uid,
          content: content,
          align: `r${role}`,
          id: this.allTimeLines.length ? this.allTimeLines.length : 0,
          playing: false,
          played: false,
        });
        this.scrollToLoggerBoxBottom();
      }
    },
    async playAll() {
      await this.allTimeLines.map(async (timeLine) => {
        if (!timeLine.played && !this.speechLoading) {
          await this.socket.emit("playMessage", {
            id: timeLine.id,
            uid: timeLine.uid,
            content: timeLine.content,
          });
        }
      });
    },
    sendTempMsg() {
      let element = this.$el.querySelector("#temp_input_box");
      if (element && element.value) {
        this.allTimeLines.push({
          uid: this.currentUser.uid,
          id: this.allTimeLines.length ? this.allTimeLines.length : 0,
          content: element.value,
          align: "r",
          playing: false,
          played: false,
        });
        element.value = "";
        this.allLogs.push({
          content: `Sent a temporary message at ${this.dayjs().format(
            "MM-DD HH:mm:ss"
          )}`,
        });
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
};
</script>

<style scoped>
.alert__playing--yes::before {
  background-color: #7cb342 !important;
}

#user_input {
  width: 100px;
}

.alert__footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  white-space: nowrap;
  border-top: 1px solid #0d0d0d;
  font-size: 12px;
  font-weight: 600;
  color: #0d0d0d;
  padding: 0.25rem 0.75rem;
}

.alert__status {
  display: flex;
  float: right;
  align-items: center;
  border-radius: 5px;
}

.alert__status::before {
  content: " ";
  flex: 0 0 auto;
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background: rgba(13, 13, 13, 0.5);
  border-radius: 50%;
  margin-right: 0.5rem;
}

.alert__status--2::before {
  background: #CC6E6E;
}

.alert__status--1::before {
  background: #5DBAB9;
}
</style>
