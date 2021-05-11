<template>
  <v-card>
    <v-card-title>
      <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
        :headers="headers"
        :items="logs"
        :search="search"
    ></v-data-table>
  </v-card>
</template>

<script>
export default {
  name: "AllLogs",
  props: {
    logs: Array
  },
  watch: {
    logs(nd){
      console.log("ND", nd)
    }
  },
  data() {
    return {
      search: '',
      headers: [
        {
          text: 'Timestamp ⏰',
          filterable: false,
          value: 'timestamp',
        },
        {text: 'Anchor', value: 'anchor'},
        {text: 'Room', value: 'room'},
        {text: 'User Email', value: 'userEmail'},
        {text: 'User Name', value: 'username'},
        {text: 'Content', value: 'content'},
      ],
    }
  },
}
</script>

<style scoped>

</style>
