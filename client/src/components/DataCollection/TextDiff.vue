<template>
  <v-row>
    <v-col>
      <v-data-table
          :headers="headers"
          :items="logs"
          item-key="username"
          sort-by="timestamp"
          group-by="type"
          class="elevation-1"
          show-group-by
      ></v-data-table>
    </v-col>
    <v-col>
      <v-textarea />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "TextDiff",
  props: {
    logs: Array
  },
  data() {
    return {
      headers: [
        { text: 'Type', value: 'type' },
        { text: 'User Name', value: 'username', groupable: false },
        { text: 'Timestamp ⏰', value: 'timestamp', align: 'right'},
      ]
    }
  }
}
</script>

<style scoped>

</style>