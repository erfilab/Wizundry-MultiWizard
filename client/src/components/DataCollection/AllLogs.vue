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
            <vue-json-to-csv :json-data="textLists" :csv-title="'text-'+query_time">
              <button class="v-btn v-btn--outlined theme--dark v-size--default" style="border-radius: 5px">
                <b>Download CSV</b>
              </button>
            </vue-json-to-csv>
            <v-btn outlined @click.stop="showChart = !showChart">
              Show Chart
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-data-table
          v-show="!showChart"
          :headers="headers"
          :items="textLists"
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
        >{{ item.newContent }}</span>
        </template>
        <template v-slot:item.lastContent="{ item }">
        <span
            class="d-inline-block text-truncate"
            style="max-width: 100px;"
        >{{ item.lastContent }}</span>
        </template>
      </v-data-table>

<!--      Chart-->
      <div id="chart" v-show="showChart">
        <apexchart type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
      </div>
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
  name: "AllLogs",
  components: {VueJsonToCsv},
  props: {
    query_time: Number,
  },
  watch: {
    query_time(newTime) {
      this.listAllTexts(newTime).then(() => {
        this.snackText = 'Successfully retrieve text data!'
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
    ...mapGetters('text', ['textLists']),
  },
  data() {
    return {
      search: '',
      headers: [
        {text: 'Type', value: 'type'},
        {text: 'Project ID', value: 'projectId'},
        {text: 'Project Name', value: 'projectName'},
        {text: 'Last Content', value: 'lastContent'},
        {text: 'New Content', value: 'newContent'},
        {text: 'User Name', value: 'username'},
        {text: 'User Role', value: 'userRole'},
        // { text: 'Confidence', value: 'confidence' },
        // { text: 'Anchor', value: 'anchor', filterable: false },
        {text: 'Timestamp ⏰', value: 'timestamp'},
      ],

      viewItems: ['ALL', 'SPEECH', "EDIT"],
      selectedView: 'ALL',

      //chart setting
      showChart: false,
      series: [{
        name: 'PRODUCT A',
        data: [44, 55, 41, 67, 22, 43]
      }, {
        name: 'PRODUCT B',
        data: [13, 23, 20, 8, 13, 27]
      }, {
        name: 'PRODUCT C',
        data: [11, 17, 15, 15, 21, 14]
      }, {
        name: 'PRODUCT D',
        data: [21, 7, 25, 13, 22, 8]
      }],
      chartOptions: {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: {
            show: true
          },
          zoom: {
            enabled: true
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }],
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 10
          },
        },
        xaxis: {
          type: 'datetime',
          categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT',
            '01/05/2011 GMT', '01/06/2011 GMT'
          ],
        },
        legend: {
          position: 'right',
          offsetY: 40
        },
        fill: {
          opacity: 1
        },
        markers: {
          colors: ['#F44336', '#E91E63', '#9C27B0']
        },
        theme: {
          monochrome: {
            enabled: true,
            color: '#255aee',
            shadeTo: 'light',
            shadeIntensity: 0.65
          }
        }
      },

      snackbar: false,
      snackText: '',
      snackColor: '',
    }
  },
  methods: {
    ...mapActions('text', ['listAllTexts']),
    getTypeColor(type) {
      if (type === 'EDIT') return 'orange'
      else return 'green'
    },
  }
}
</script>

<style scoped>
</style>
