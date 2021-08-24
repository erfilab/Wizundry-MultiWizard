<template>
  <v-data-table
    :headers="headers"
    :items="logs"
    :items-per-page="30"
    class="elevation-1"
  ></v-data-table>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          text: "Username",
          align: "start",
          sortable: false,
          value: "username",
        },
        { text: "type", value: "type" },
        { text: "timestamp", value: "timestamp" },
        { text: "Value", value: "value" },
        { text: "Status", value: "status" },
      ],
      logs: []
    };
  },
  async mounted() {
      const res = await this.$store.dispatch("GetAllLogs");
    //   this.logs = res.data;
      console.log('res', res)
  }
};
</script>

<style>
</style>