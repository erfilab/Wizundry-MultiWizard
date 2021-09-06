<template>
  <v-container>
    <v-row dense>
      <v-col
        v-for="item in items"
        :key="item.id"
        cols="6"
      >
        <v-row>
          <v-col>
            <v-card :color="item.color">
              <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                  <v-text-field
                    v-model="item.title"
                    class="mt-3 ml-3"
                    @keyup.enter="item.color === '#f0f0f0' ? speakerEvent2(item) : speakerEvent(item)"
                  />
                </div>
                <v-btn
                  text
                  x-small
                  style="top: 10%; position: absolute;right: 0;"
                  @click="speakerEvent(item)"
                >
                  <v-icon>
                    {{
                      item.actionStatus ? "mdi-pause" : "mdi-play"
                    }}
                  </v-icon>
                </v-btn>
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
        title: "Wait for seconds.",
        actionStatus: false,
      },
      {
        id: 4,
        color: "#CDE589",
        title: "I can't find it.",
        actionStatus: false,
      },
      {
        id: 5,
        color: "#CDE589",
        title: "How to spell?",
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
      this.$emit("speak", {...item, style: 1, status: !item.actionStatus});
    },
    speakerEvent2(item) {
      console.log('2', item.title);
      this.$emit("speak", {...item, style: 2, status: !item.actionStatus});
    },
  },
};
</script>

<style scoped>
.btn-toggle {
  flex-direction: column;
}
</style>
