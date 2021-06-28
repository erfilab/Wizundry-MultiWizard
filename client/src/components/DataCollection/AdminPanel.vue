<template>
  <v-container fluid>
      <v-toolbar flat>
        <v-toolbar-title>Admin Dashboard</v-toolbar-title>

        <v-spacer></v-spacer>
        <v-row>
          <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="date"
                  class="mt-5"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="date" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="$refs.menu.save(date)">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-row>

        <template v-slot:extension>
          <v-tabs
              v-model="tab"
              align-with-title
          >
            <v-tabs-slider color="yellow"></v-tabs-slider>

            <v-tab
                v-for="item in items"
                :key="item.title"
            >
              {{ item.title }}
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>

      <v-tabs-items v-model="tab">
        <v-tab-item
            v-for="item in items"
            :key="item.title"
        >
          <v-card flat>
            <v-card-text>
              <component :is="item.content" :query_time="formatDate"></component>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>

  </v-container>
</template>

<script>
import AllLogs from "@/components/DataCollection/AllLogs";
import TextDiff from "@/components/DataCollection/TextDiff";
import CreateUser from '@/components/DataCollection/CreateUser';
import ProjectUserRecord from "@/components/DataCollection/ProjectUserRecord";
import AllBehaviorLogs from "@/components/DataCollection/AllBehaviorLogs";
import AllAnchorLogs from "@/components/DataCollection/AllAnchorLogs";

import {mapGetters} from 'vuex';
export default {
  name: "AdminPanel",
  components: {
    AllLogs,
    TextDiff,
    CreateUser,
    ProjectUserRecord,
    AllBehaviorLogs,
    AllAnchorLogs,
  },
  watch: {
    date(newVal) {
      this.formatDate =  this.dayjs(newVal).valueOf()
    },
    getCurrentUser(newVal) {
      if (newVal) {
        this.initProject();
      }
    }
  },
  computed: {
    ...mapGetters('user', ['getCurrentUser']),
  },
  data() {
    return {
      date: new Date().toISOString().substr(0, 10),
      formatDate: this.dayjs().valueOf(),
      menu: false,
      logs: [],

      tab: null,
      items: [
        {
          title: 'Create User',
          content: 'CreateUser'
        },
        {
          title: 'Projects-Users',
          content: 'ProjectUserRecord'
        },
        {
          title: 'All Text Logs',
          content: 'AllLogs'
        },
        {
          title: 'All Behavior Logs',
          content: 'AllBehaviorLogs'
        },
        {
          title: 'All Anchor Logs',
          content: 'AllAnchorLogs'
        },
        {
          title: 'Text Diff',
          content: 'TextDiff'
        }
      ],
    }
  },
  methods: {
    async initProject() {
    }
  },
  async mounted() {
  }
}
</script>

<style scoped>

</style>
