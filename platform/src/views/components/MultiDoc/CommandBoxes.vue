<template>
  <v-container>
    <v-row dense>
      <v-col v-for="(item, i) in items" :key="i" cols="12">
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
        color: "#CDE589",
        title: "Can You Repeat",
        artist: "Foster the People",
        actionStatus: false,
      },
      {
        id: 1,
        color: "#CDE589",
        title: "Sorry I don't understand",
        artist: "Foster the People",
        actionStatus: false,
      },
      {
        id: 2,
        color: "#CDE589",
        title: "Can You Speak Slowly",
        artist: "this can be modified",
        actionStatus: false,
      },
      {
        id: 3,
        color: "#CDE589",
        title: "I got it.",
        artist: "Ellie Goulding",
        actionStatus: false,
      },
      {
        id: 4,
        color: "#CDE589",
        title: "Yeah, it's true!",
        artist: "Ellie Goulding",
        actionStatus: false,
      },
      {
        id: 5,
        color: "#CDE589",
        title: "No, I don't think so.",
        artist: "Ellie Goulding",
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
