<template>
  <v-card>
    <v-card-title> Create Projects and Users</v-card-title>
    <v-card-text>
      <v-form
          ref="form"
          v-model="valid"
          lazy-validation
      >
        <v-row>
          <v-col cols="4">
            <v-text-field
                v-model="userInfo.email"
                :rules="emailRules"
                label="E-mail"
                required
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
                v-model="userInfo.password"
                label="Password"
                required
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
                v-model="userInfo.name"
                label="User Name"
                required
            ></v-text-field>
          </v-col>
          <v-row>
            <v-spacer/>
            <v-col cols="4" class="mr-2">
              <v-btn @click="create()" color="#3E6189" large :disabled="!valid">
                <v-icon>mdi-account-plus</v-icon>
                Create
              </v-btn>
              <v-btn @click="reset" class="ml-2" large>
                reset
              </v-btn>
            </v-col>
          </v-row>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "CreateUser",
  data() {
    return {
      valid: true,
      userInfo: {
        email: "",
        password: "",
        name: '',
      },
      projectInfo: {},

      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
    }
  },
  computed: {
    ...mapGetters('user', ['getCurrentUser']),
  },
  methods: {
    ...mapActions('user', ['createUserAndProject']),
    async create() {
      if (!this.$refs.form.validate()) alert("Please complete the login form.")
      else {
        this.userInfo = {...this.userInfo, createdAt: this.dayjs(), role: 'participant'};
        console.log("UI", this.userInfo, "\nCU", this.getCurrentUser)
        this.projectInfo = {
          name: `${this.userInfo.name}-${this.dayjs().format('YYYY-MM-DD')}`,
          creator: this.getCurrentUser.email,
          participant: this.userInfo.name,
          createdAt: this.dayjs(),
        }
        await this.createUserAndProject({userInfo: this.userInfo, projectInfo: this.projectInfo}).catch(console.error);
      }
    },
    reset() {
      this.$refs.form.reset()
    },
  },
  mounted() {
    console.log('jheniej', this.getCurrentUser)
  }
}
</script>

<style scoped>

</style>