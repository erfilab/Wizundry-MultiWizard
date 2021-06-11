<template>
  <div>
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
          <v-col cols="2">
            <vue-json-to-csv :json-data="behaviorLogs" :csv-title="'behavior-'+query_time">
              <button class="orange button pa-1" style="border-radius: 5px">
                <b>Download CSV</b>
              </button>
            </vue-json-to-csv>
          </v-col>
        </v-row>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="behaviorLogs"
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
      </v-data-table>
    </v-card>

    <v-snackbar
        v-model="snackbar"
        timeout=2000
        :color="snackColor"
    >
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';
import VueJsonToCsv from 'vue-json-to-csv'

export default {
  name: "AllBehaviorLogs",
  components: {VueJsonToCsv},
  props: {
    query_time: Number,
  },
  watch: {
    query_time(newTime) {
      this.listAllBehaviors(newTime).then(() => {
        this.snackText = 'Successfully retrieve behavior data!'
        this.snackColor = 'green'
        this.snackbar = true;
      }).catch(err => {
        this.snackText = `${err}`;
        this.snackColor = 'red'
        this.snackbar = true;
      })
    },
    selectedView() {
      // if (newView === 'All') this.filteredLogs = this.logs;
      // else this.filteredLogs = this.logs.filter(log => log.type === newView)
    }
  },
  computed: {
    ...mapGetters('text', ['behaviorLogs']),
  },
  data() {
    return {
      search: '',

      headers: [
        {text: 'Project ID', value: 'projectId'},
        {text: 'Type', value: 'type'},
        {text: 'Status', value: 'status'},
        {text: 'Timestamp ⏰', value: 'timestamp'},
      ],

      viewItems: ['ALL', 'PROJ', 'RECORD', "SPEAKER"],
      selectedView: 'ALL',


      snackbar: false,
      snackText: '',
      snackColor: '',
    }
  },
  methods: {
    ...mapActions('text', ['listAllBehaviors']),
    getTypeColor(type) {
      if (type === 'PROJ') return 'orange'
      else if (type === 'RECORD') return 'green'
      else if (type === 'SPEAKER') return 'cyan'
    },
  }
}
</script>

<style scoped>
</style>
