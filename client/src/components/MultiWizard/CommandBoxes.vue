<template>
  <v-container>
    <v-row dense>
      <v-col
          v-for="(item, i) in items"
          :key="i"
          cols="12"
      >
        <v-card
            :color="item.color"
            dark
        >
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-text-field
                  class="mt-3 ml-3"
                  v-model="item.title"
              ></v-text-field>
<!--              <v-card-subtitle v-text="item.artist"></v-card-subtitle>-->
            </div>
            <v-btn
                class="mt-4"
                :color="item.actionStatus ? '#393838' : '#232222'"
                text
                @click="speakerEvent(item)"
            >
              <v-icon large>{{
                  item.actionStatus ? "mdi-pause" : "mdi-play"
                }}
              </v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "CommandBoxes",
  data: () => ({
    items: [
      {
        color: '#1F7087',
        title: 'Can You Repeat',
        artist: 'Foster the People',
        actionStatus: false,
      },
      {
        color: '#1F7087',
        title: 'Sorry I don\'t understand',
        artist: 'Foster the People',
        actionStatus: false,
      },
      {
        color: '#1F7087',
        title: '{{Predefined Script}}',
        artist: 'this can be modified',
        actionStatus: false,
      },
      {
        color: '#952175',
        title: '{{ Action Name }}',
        artist: 'Ellie Goulding',
        actionStatus: false,
      },
      {
        color: '#952175',
        title: 'Turn Right',
        artist: 'Ellie Goulding',
        actionStatus: false,
      },
    ],
    isTesting: false,
    loading: false,
    loader: null
  }),
  watch: {
    loader () {
      const l = this.loader
      this[l] = !this[l]

      setTimeout(() => (this[l] = false), 3000)

      this.loader = null
    },
  },
  methods: {
    speakerEvent (item) {
      console.log(item.title)
      this.$emit('startSpeak', item.title)
      // item.actionStatus = !item.actionStatus
    }
  },
}
</script>

<style scoped>

</style>
