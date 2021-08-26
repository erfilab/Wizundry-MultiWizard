<template>
  <v-container>
    <v-row dense>
      <v-col v-for="item in items" :key="item.id" cols="6">
        <v-row>
          <v-col cols=2>
            <v-btn-toggle borderless dense style="flex-direction: column;">
              <v-btn @click="speakerEvent(item)">
                <v-icon>{{
                  item.actionStatus ? "mdi-pause" : "mdi-play"
                }}</v-icon>
              </v-btn>
              <v-btn @click="speakerEvent2(item)">
                <v-icon>{{item.actionStatus ? "mdi-progress-close" : "mdi-repeat-once"}}</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col>
            <v-card :color="item.color">
              <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                  <v-text-field
                    class="mt-3 ml-3"
                    v-model="item.title"
                  ></v-text-field>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col v-for="item in items2" :key="item.id" cols="6">
        <v-row>
          <v-col cols=2>
            <v-btn-toggle borderless dense style="flex-direction: column;">
              <v-btn @click="speakerEvent(item)">
                <v-icon>{{
                  item.actionStatus ? "mdi-pause" : "mdi-play"
                }}</v-icon>
              </v-btn>
              <v-btn @click="speakerEvent2(item)">
                <v-icon>{{item.actionStatus ? "mdi-progress-close" : "mdi-repeat-once"}}</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col>
            <v-card :color="item.color">
              <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                  <v-text-field
                    class="mt-3 ml-3"
                    v-model="item.title"
                  ></v-text-field>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "CommandBoxes",
  props: {
    talking: {
      type: Boolean,
      default: false,
    },
    itemTalking: {
      type: Number,
      default: -1,
    },
    itemStyle: {
      type: Number,
      default: 1,
    }
  },
  data: () => ({
    speaker_type: 0,
    items: [
      {
        id: 0,
        color: "#f0f0f0",
        title: "",
        actionStatus: false,
      },
      {
        id: 1,
        color: "#f0f0f0",
        title: "",
        actionStatus: false,
      },
      {
        id: 2,
        color: "#CDE589",
        title: "Can You Speak Slowly",
        actionStatus: false,
      },
      {
        id: 3,
        color: "#CDE589",
        title: "I got it.",
        actionStatus: false,
      },
      {
        id: 4,
        color: "#CDE589",
        title: "Yeah, it's true!",
        actionStatus: false,
      },
      {
        id: 5,
        color: "#CDE589",
        title: "No, I don't think so.",
        actionStatus: false,
      },
    ],
    items2: [
      {
        id: 6,
        color: "#CDE589",
        title: "Can You Repeat",
        actionStatus: false,
      },
      {
        id: 7,
        color: "#CDE589",
        title: "Sorry I don't understand",
        actionStatus: false,
      },
      {
        id: 8,
        color: "#CDE589",
        title: "Can You Speak Slowly",
        actionStatus: false,
      },
      {
        id: 9,
        color: "#CDE589",
        title: "I got it.",
        actionStatus: false,
      },
      {
        id: 10,
        color: "#CDE589",
        title: "Yeah, it's true!",
        actionStatus: false,
      },
      {
        id: 11,
        color: "#CDE589",
        title: "No, I don't think so.",
        actionStatus: false,
      },
    ],
    isTesting: false,
    loading: false,
  }),
  watch: {
    itemTalking(newVal, oldVal) {
      console.log("it", newVal);
      if (newVal !== -1) {
        if (this.itemStyle === 2) this.items[newVal].title = "";
        this.items[newVal].actionStatus = true;
      } else {
        this.items[oldVal].actionStatus = false;
      }
    },
  },
  methods: {
    speakerEvent(item) {
      console.log(item.title);
      this.$emit("startSpeak", {...item, style: 1});
      // item.actionStatus = !item.actionStatus
    },
    speakerEvent2(item) {
      console.log('2', item.title);
      this.$emit("startSpeak", {...item, style: 2});
    },
  },
};
</script>

<style scoped>
.btn-toggle {
  flex-direction: column;
}
</style>
