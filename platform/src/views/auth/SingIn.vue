<template>
  <v-container class="container--fluid">
    <v-row
      no-gutters
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="4"
        lg="4"
      >
        <v-card class="elevation-0 pa-3 mt-5">
          <v-card-text>
            <div class="layout column align-center">
              <h1 class="text-center my-4 primary--text">
                Multi-Wizards
              </h1>
            </div>
            <v-form>
              <v-text-field
                v-model="userInfo.username"
                append-icon="mdi-account"
                name="username"
                label="username"
                type="name"
                required
                autocomplete="username"
              />
              <v-text-field
                v-model="trialInfo.trialName"
                append-icon="mdi-movie-open"
                name="trialName"
                label="trialName"
                type="text"
                required
              />
              <v-switch
                v-model="userInfo.dominant"
                :label="userInfo.dominant? 'Dominant Wizard' : 'Normal Wizard'"
              ></v-switch>
            </v-form>
          </v-card-text>
          <v-card-text>
            <v-row
              class="text-center"
              dense
              no-gutters
            >
              <v-col cols="12">
                <v-btn-toggle>
                  <v-btn
                    text
                    color="warning"
                    @click="() => (userInfo.userRole = 'user')"
                  >
                    <span>Users</span>
                  </v-btn>
                  <v-btn
                    text
                    color="warning"
                    @click="() => (userInfo.userRole = 'wizard')"
                  >
                    <span>Wizard</span>
                  </v-btn>
                  <v-btn
                    text
                    color="warning"
                    @click="() => (userInfo.userRole = 'observer')"
                  >
                    <span>Observer</span>
                  </v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <localization/>
            <v-spacer/>
            <v-btn
              color="primary"
              :loading="loading"
              @click="start"
            >
              Trial Start
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col>
        <v-checkbox
          v-for="(task, name) in tasks"
          :key="name"
          v-model="userInfo.selectedTasks"
          :label="task"
          :value="name"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Localization from "../widget/AppLocalization.vue";
import {Tasks} from '@/utils/tasks.ts'

export default {
  name: "SingIn",
  components: {Localization},
  data: () => ({
    loading: false,

    // tasks: ["dictation", "label (participants)", "label (content)", "highlight", "note taking", "summarization"],
    tasks: Tasks,
    userInfo: {
      username: "wizard2",
      userRole: "wizard",
      dominant: false,
      selectedTasks: ["DICT"]
    },
    trialInfo: {
      trialName: "1-3",
      connectedUsers: {}
    }
  }),
  methods: {
    uuidv4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    async login() {
      if (this.model.username.length && this.model.password.length) {
        await this.$store
          .dispatch("LoginByPassword", {
            username: this.model.username,
            password: this.model.password,
            roles: this.model.roles,
          })
          .then(() => this.$router.push(this.$route.query.redirect || "/"))
          .catch((err) => {
            this.$root.vtoast.show({
              showSnackbar: true,
              message: err.message,
              color: "error",
            });
          });
      } else {
        this.$root.vtoast.show({
          showSnackbar: true,
          message: "Please filled in all field",
          color: "error",
        });
      }
    },
    async start() {
      const userInfo = {
        userId: this.uuidv4(),
        ...this.userInfo,
        loginTime: new Date().toJSON().substring(0, 19).replace('T', ' ')
      };
      const userId = userInfo.userId
      this.trialInfo.connectedUsers = {[userId]: userInfo}

      await this.$store.dispatch("StartTrial", {
        userInfo: {...userInfo},
        trialInfo: {
          trialId: this.uuidv4(),
          ...this.trialInfo,
          trialStartTime: new Date().toJSON().substring(0, 19).replace('T', ' ')
        }
      })

      await this.$router.push({name: 'editor'})
    }
  },
};
</script>
