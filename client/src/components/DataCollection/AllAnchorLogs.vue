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
          <v-col cols="2">
            <vue-json-to-csv :json-data="anchorLogs" :csv-title="'anchor-'+query_time">
              <button class="orange button pa-1" style="border-radius: 5px">
                <b>Download CSV</b>
              </button>
            </vue-json-to-csv>
          </v-col>
        </v-row>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="anchorLogs"
          :search="search"
          :footer-props="{
          showFirstLastPage: true,
          itemsPerPageOptions: [50, 100, 300],
        }"
      >
        <template v-slot:item.innerHTML="{ item }">
        <span
            class="d-inline-block text-truncate"
            style="max-width: 150px;"
        >{{ item.innerHTML }}</span>
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
  name: "AllAnchorLogs",
  components: {VueJsonToCsv},
  props: {
    query_time: Number,
  },
  watch: {
    query_time(newTime) {
      this.listAllAnchors(newTime).then(() => {
        this.snackText = 'Successfully retrieve anchors data!'
        this.snackColor = 'green'
        this.snackbar = true;
      }).catch(err => {
        this.snackText = `${err}`;
        this.snackColor = 'red'
        this.snackbar = true;
      })
    },
  },
  computed: {
    ...mapGetters('text', ['anchorLogs']),
  },
  data() {
    return {
      search: '',

      headers: [
        {text: 'Project ID', value: 'projectId'},
        {text: 'Client X', value: 'clientX'},
        {text: 'Client Y', value: 'clientY'},
        {text: 'Inner HTML', value: 'innerHTML'},
        {text: 'Anchor', value: 'anchor'},
        {text: 'Timestamp ⏰', value: 'timestamp'},
      ],


      snackbar: false,
      snackText: '',
      snackColor: '',
    }
  },
  methods: {
    ...mapActions('text', ['listAllAnchors']),
  }
}
</script>

<style scoped>
</style>
