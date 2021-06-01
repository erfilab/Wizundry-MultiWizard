<template>
  <v-card>
    <v-card-text>
      <v-form
          ref="form"
          v-model="valid"
          lazy-validation
      >
        <v-row>
          <v-col cols="4">
            <v-text-field
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                required
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
                v-model="password"
                label="Password"
                required
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
                v-model="name"
                label="User Name"
                required
            ></v-text-field>
          </v-col>
          <v-row>
            <v-col cols="3">
              <v-select
                  v-model="role"
                  :items="roles"
                  :rules="[v => !!v || 'Role is required']"
                  label="Role"
                  required
              ></v-select>
            </v-col>
            <v-spacer/>
            <v-col cols="4" class="mr-2">
              <v-btn @click="join()" color="#3E6189" large :disabled="!valid">
                <v-icon>mdi-account-plus</v-icon>
                Join
              </v-btn>
              <v-btn @click="reset" class="ml-2" large>
                reset
              </v-btn>
              <v-btn @click="loginByGoogle">Using Google</v-btn>
            </v-col>
          </v-row>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import {mapActions} from 'vuex'
import * as firebase from "@/firebase";
import {provider} from "@/firebase";
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:3000',
  json: true
})

export default {
  name: "LoginForm",
  data() {
    return {
      valid: true,
      email: "",
      password: "",
      name: '',
      role: '',
      roles: [
        "experimenter",
        "participant",
        "admin"
      ],

      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
    }
  },
  methods: {
    ...mapActions('auth', ['loginUser']),
    join() {
      if (!this.$refs.form.validate()) {
        alert("Please complete the login form.")
        return;
      }

      this.loginUser({
        email: this.email,
        password: this.password,
        name: this.name,
        role: this.role,
        createdAt: this.dayjs()
      })
    },
    async loginByGoogle(){
      await firebase.auth.signInWithPopup(provider).then( (user) => {
        console.log("USER: ", user)
      }).catch(console.error)
    },
    reset() {
      this.$refs.form.reset()
    },
  },
  async mounted() {
    if (process.env.NODE_ENV !== 'production') {
      this.email = process.env.VUE_APP_EMAIL
      this.password = process.env.VUE_APP_PSWD
      this.name = process.env.VUE_APP_NAME
      this.role = process.env.VUE_APP_ROLE
    }

    if (firebase.auth.currentUser) {
      firebase.auth.currentUser.getIdToken(true)
          .then((idToken) => {
            client({
              method: 'get',
              url: '/',
              headers: {
                'AuthToken': idToken
              }
            }).then((res) => {
              this.response = res.data.message
            }).catch((error) => {
              this.response = error
            })
          }).catch(() => {
        this.response = "Error getting auth token"
      })}
    // await firebase.auth.currentUser.getIdToken(true).then(res => console.log('token, ', res))
  }
}
</script>

<style scoped>

</style>
