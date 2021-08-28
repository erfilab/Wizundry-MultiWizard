<template>
  <v-card>
    <v-card-title>
      MultiDoc Logs
      <v-spacer></v-spacer>
      <v-row>
        <v-col>
          <v-menu
            ref="start_menu"
            v-model="start_menu"
            :close-on-content-click="false"
            :return-value.sync="start"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="start"
                label="Start Time Picker"
                prepend-icon="mdi-calendar"
                readonly
                clearable
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="start" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="start_menu = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="$refs.start_menu.save(start)">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col>
          <v-menu
            ref="end_menu"
            v-model="end_menu"
            :close-on-content-click="false"
            :return-value.sync="end"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="end"
                label="End Time Picker"
                prepend-icon="mdi-calendar"
                readonly
                clearable
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="end" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="end_menu = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="$refs.end_menu.save(end)">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Key Word Search"
            single-line
            clearable
            hide-details
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <vue-json-to-csv
          :json-data="allLogs"
          :csv-title="'multidoc-logs-' + search"
        >
          <button
            class="v-btn v-btn--outlined v-size--default"
            style="border-radius: 5px"
          >
            <b>Download</b>
          </button>
        </vue-json-to-csv>
        <v-btn @click.end="searchLogs" color="primary" elevation="2" outlined
          >Search</v-btn
        >
      </v-row>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="allLogs"
      :items-per-page="30"
      class="elevation-1"
      :search="search"
    />
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import VueJsonToCsv from "vue-json-to-csv";

export default {
  components: { VueJsonToCsv },
  data() {
    return {
      search: "",
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
      start: null,
      end: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      start_menu: false,
      end_menu: false,
    };
  },
  computed: {
    ...mapGetters(["allLogs"]),
  },
  methods: {
    async searchLogs() {
      console.log(this.start, this.end);
      await this.$store.dispatch("GetAllLogs", {
        start: new Date(this.start)
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        end: new Date(this.end).toISOString().slice(0, 19).replace("T", " "),
      });
    },
  },
  async mounted() {
    // get day before one month
    await this.$store.dispatch("GetAllLogs", {
      end: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
  },
};
</script>

<style></style>
