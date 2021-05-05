<template>
  <v-card>
    <v-card-text>
      <v-form>
        <v-row>
          <v-col cols="4">
            <v-text-field
                v-model="email"
                label="Email"
                outlined
            ></v-text-field>
          </v-col>

          <v-col cols="4">
            <v-text-field
                v-model="username"
                label="Username"
                outlined
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-radio-group v-model="role">
              <v-radio label="Admin" value="admin" />
              <v-radio label="Experimenter" value="experimenter" />
              <v-radio label="Participant" value="participant" />
            </v-radio-group>
          </v-col>
          <v-col cols="1" class="ma-2">
            <v-btn @click="join()" color="#3E6189" large>
              <v-icon>mdi-account-plus</v-icon>
              Join
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapMutations } from 'vuex'
import dayjs from 'dayjs'

export default {
  name: "LoginForm",
  data() {
    return {
      email: null,
      username: null,
      role: null,
    }
  },
  methods: {
    ...mapMutations('auth', ['setCurrentUser']),
    join() {
      if (!this.email) {
        alert("You must enter an email");
        return;
      }
      if (!this.username) {
        alert("You must choose a username");
        return;
      }
      this.setCurrentUser({
        email: this.email,
        username: this.username,
        role: this.role,
        createdAt: dayjs()
      })
      this.$router.push('text')
    },
  }
}
</script>

<style scoped>

</style>