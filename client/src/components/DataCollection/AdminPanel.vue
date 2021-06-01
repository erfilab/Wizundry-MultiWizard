<template>
  <v-container>

      <v-toolbar flat>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

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
              <component :is="item.content" :logs="logs"></component>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>

  </v-container>
</template>

<script>
import { db } from "@/services/firebase";
import AllLogs from "@/components/DataCollection/AllLogs";
import TextDiff from "@/components/DataCollection/TextDiff";
import axios from 'axios'
import * as firebase from "@/services/firebase";

const client = axios.create({
  baseURL: 'http://localhost:3000',
  json: true
})

export default {
  name: "AdminPanel",
  components: {
    AllLogs,
    TextDiff,
  },
  watch: {
    async date() {
      let textEditorLogs = await db.collection(`${this.date}`).get();
      const logs = [];
      textEditorLogs.forEach((doc) => {
        let appData = doc.data();
        appData.id = doc.id;
        logs.push({ ...appData });
      });
      this.logs = logs;
      console.log(this.logs)
    }
  },
  data() {
    return {
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      logs: [],

      tab: null,
      items: [
        {
          title: 'All Logs',
          content: 'AllLogs'
        },
        {
          title: 'Text Diff',
          content: 'TextDiff'
        }
      ],
      text: 'Lorem ipsum',
    }
  },
  async mounted() {
    await firebase.auth.currentUser.getIdToken(true)
        .then((idToken) => {
          client({
            method: 'get',
            url: '/admin',
            headers: {
              'authorization': `Bearer ${idToken}`
            }
          }).then(async (res) => {
            console.log("SUCCESS", res)
            let textEditorLogs = await db.collection(`${this.date}`).get();
            const logs = [];
            textEditorLogs.forEach((doc) => {
              let appData = doc.data();
              appData.id = doc.id;
              logs.push({ ...appData });
            });
            this.logs = logs;
          }).catch((error) => {
            console.log("EROOR", error)
          })
        }).catch(() => {
          console.log("ERROR on getting token")
    })
  }
}
</script>

<style scoped>

</style>
