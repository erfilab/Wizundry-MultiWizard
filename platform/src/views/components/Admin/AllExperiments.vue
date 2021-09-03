<template>
  <v-card>
    <v-card-title v-if="isAdmin">
      All Experiment Records
      <v-spacer />
      <v-row>
        <v-col>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Key Word Search"
            single-line
            clearable
            hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <vue-json-to-csv
          :json-data="allExperiment"
          :csv-title="'experiments-records-' + search"
        >
          <button
            class="v-btn v-btn--outlined v-size--default"
            style="border-radius: 5px"
          >
            <b>Download</b>
          </button>
        </vue-json-to-csv>
        <v-btn
          color="primary"
          elevation="2"
          outlined
          @click.end="searchLogs"
        >
          Search
        </v-btn>
      </v-row>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="allExperiment"
      :items-per-page="50"
      class="elevation-1"
      :search="search"
    >
      <template v-slot:[`item.actions`]="{item}">
        <v-icon
          class="mr-2"
          @click="join(item)"
        >
          mdi-location-enter
        </v-icon>
        <v-icon
          v-if="isAdmin"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
        <v-icon
          v-if="isAdmin"
          @click="inspectLogs(item)"
        >
          mdi-file-search
        </v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import VueJsonToCsv from "vue-json-to-csv";

export default {
  name: "AllExperiments",
  components: { VueJsonToCsv },
  data() {
    return {
      search: "",
      headers: [
        {
          value: "id",
          sortable: false,
          text: "ID",
        },
        {
          text: "Project Name",
          align: "start",
          sortable: false,
          value: "project_name",
        },
        {
          text: "Username",
          align: "start",
          sortable: false,
          value: "username",
        },
        { text: "Type", value: "type" },
        { text: "Division", value: "division" },
        { text: "Features", value: "features" },
        { text: "Created At", value: "created_at" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  computed: {
    ...mapGetters(["allExperiment", "isAdmin"]),
  },
  async mounted() {
    await this.$store.dispatch("GetAllExperiments");
  },
  methods: {
    async searchLogs() {
      await this.$store.dispatch("GetAllExperiments");
    },
    async deleteItem(item) {
      await this.$store.dispatch("DeleteExperiment", item.id);
      // await this.$store.dispatch("GetAllExperiments");
    },
    async join(item) {
      await this.$store.dispatch("GetSingleExperiment", item.id);
      this.$router.push({ name: "MultiDoc", replace: true });
    },
    async inspectLogs(item) {
      await this.$store.dispatch("GetExperimentLogsById", item.id);
    },
  },
};
</script>

<style></style>
