<template>
  <v-container>
    <v-row style="display: block">
      <v-card class="overflow-hidden">
        <v-app-bar
            absolute
            color="#212D3B"
            hide-on-scroll
            scroll-target="#scrolling-techniques-4"
        >
          <v-toolbar-title>Chat History</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>mdi-share</v-icon>
          </v-btn>
        </v-app-bar>
        <v-sheet
            id="scrolling-techniques-4"
            class="overflow-y-auto"
            max-height="500"
        >
          <v-container style="height: 1000px; background-color: #151E27;">
            <MessageUnit :messages="messages" :selfUserName="this.currentUser.name"/>
          </v-container>
        </v-sheet>
          <v-row class="pt-5 pl-3 pr-3" style="background-color: #212D3B;">
            <v-col cols="8">
              <v-text-field
                  v-model="message"
                  label="Message"
                  outlined
                  @keyup.enter="send"
              ></v-text-field>
            </v-col>
            <v-spacer />
            <v-col cols="4" class="text-right">
              <v-btn class="mr-3" large outlined @click="this.audioInput" :color="isSpeaking? '#5B438D' : '#3572A5'">
                {{ isSpeaking ? 'Stop Audio' : 'Start Audio' }}
                <v-icon v-if="!isSpeaking" right>mdi-microphone</v-icon>
                <v-icon v-else right> mdi-microphone-off</v-icon>
              </v-btn>
              <v-btn @click="send" medium class="mr-2" fab color="#3572A5">
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </v-col>
          </v-row>

      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import SpeechToText from '../services/speech-to-text';
import MessageUnit from "@/components/MessageUnit";
import { mapGetters } from 'vuex'
// import io from 'socket.io-client'

export default {
  name: "ChatBody",
  components: {
    MessageUnit
  },
  computed: {
    ...mapGetters('auth', ['getCurrentUser']),
  },
  data() {
    return {
      socket: null,

      message: null,
      currentUser: {},

      participants: [],
      messages: [
        {
          name: 'default',
          email: 'r@g.com',
          role: 'participant',
          message: 'This is the default content',
          timestamp: '2021-03-26',
        }
      ],

      // speech to text
      isSpeaking: false,
      speechService: {},
    };
  },
  methods: {
    // ...mapMutations('user', ['addUserToUserList']),
    send() {
      if (this.message !== "") {
        this.socket.emit("msg",
            {
              name: this.currentUser.name,
              email: this.currentUser.email,
              role: this.currentUser.role,
              message: this.message,
              timestamp: this.dayjs()
            }
        );
        this.message = "";
      }
    },
    audioInput() {
      this.isSpeaking = true;
      this.speechService.speak().subscribe(
          result => {
            this.isSpeaking = false;
            this.message = result;
            console.log('Result', result);
          },
          (err) => {
            console.error(err);
            this.isSpeaking = false;
          },
          () => {
            this.isSpeaking = false;
          }
      );
      console.log('speechService started');
    }
  },
  mounted() {
    this.currentUser = this.getCurrentUser
    // let HOST = 'http://localhost:3000/'
    // if (process.env.NODE_ENV === 'production')
    //   HOST = 'https://ryanyen2.me/'
    //
    // this.socket = io(HOST + this.room)
    //   .on("message", e => {
    //     let msg = JSON.parse(e.data);
    //     console.log("Message", msg)
    //     this.messages.push({...e})
    // });
    console.log(this.currentUser)
  },
  created() {
    this.speechService = new SpeechToText();
  }
};
</script>

<style scoped>
</style>
