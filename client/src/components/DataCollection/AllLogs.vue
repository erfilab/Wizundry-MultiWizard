<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col>
          <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
          ></v-text-field>
        </v-col>
        <v-col>
          <v-select
              :items="viewItems"
              label="Filter Logs"
              outlined
              v-model="selectedView"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-title>
    <v-data-table
        :headers="headers"
        :items="filteredLogs"
        :search="search"
        :footer-props="{
          showFirstLastPage: true,
          itemsPerPageOptions: [50, 100, 300],
        }"
    >
      <template v-slot:item.type="{ item }">
        <v-chip
            :color="getTypeColor(item.type)"
        >
          {{ item.type }}
        </v-chip>
      </template>
      <template v-slot:item.newContent="{ item }">
        <span
            class="d-inline-block text-truncate"
            style="max-width: 150px;"
        >{{item.newContent}}</span>
      </template>
      <template v-slot:item.lastContent="{ item }">
        <span
            class="d-inline-block text-truncate"
            style="max-width: 100px;"
        >{{item.lastContent}}</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  name: "AllLogs",
  props: {
    logs: Array
  },
  watch: {
    logs(allLogs){
      // console.log("ND", nd)
      this.filteredLogs = allLogs
    },
    selectedView(newView) {
      if (newView === 'All') this.filteredLogs = this.logs;
      else this.filteredLogs = this.logs.filter(log => log.type === newView)
    }
  },
  data() {
    return {
      search: '',
      filteredLogs: [],
      headers: [
        { text: 'Type', value: 'type' },
        { text: 'Last Content', value: 'lastContent' },
        { text: 'New Content', value: 'newContent' },
        { text: 'Room', value: 'room' },
        { text: 'User Name', value: 'username' },
        { text: 'User Role', value: 'userRole'},
        { text: 'Confidence', value: 'confidence' },
        { text: 'Anchor', value: 'anchor', filterable: false },
        { text: 'Timestamp ⏰', value: 'timestamp'},
      ],

      viewItems: ['ALL', 'SPEECH', "EDIT"],
      selectedView: 'ALL',
    }
  },
  methods: {
    getTypeColor(type) {
      if (type==='EDIT') return 'orange'
      else return 'green'
    }
  }
}
</script>

<style scoped>

</style>
