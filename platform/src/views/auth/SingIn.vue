<template>
  <v-container class="container--fluid fill-height primary">
    <v-row no-gutters align="center" justify="center">
      <v-col cols="12" sm="8" md="4" lg="4">
        <v-card class="elevation-5 pa-3">
          <v-card-text>
            <div class="layout column align-center">
              <img
                src="img/icons/icon-144x144.png"
                alt="Wizard of Oz Logo"
                width="120"
                height="120"
              />
              <h1 class="text-center my-4 primary--text">Wizard of Oz</h1>
            </div>
            <v-form>
              <v-text-field
                v-model="model.username"
                append-icon="mdi-account"
                name="username"
                label="username"
                type="name"
                required
                autocomplete="username"
              />
              <v-text-field
                v-model="model.password"
                append-icon="mdi-lock"
                name="password"
                :label="$t('login.password')"
                type="password"
                required
                autocomplete="current-password"
              />
            </v-form>
          </v-card-text>
          <v-card-text>
            <v-row class="text-center" dense no-gutters>
              <v-col cols="12">
                <v-btn-toggle>
                  <v-btn
                    text
                    color="warning"
                    @click="() => (model.roles = ['user'])"
                  >
                    <span>Users</span>
                  </v-btn>
                  <v-btn
                    text
                    color="warning"
                    @click="() => (model.roles = ['wizard', 'user'])"
                  >
                    <span>Wizard</span>
                  </v-btn>
                   <v-btn
                    text
                    color="warning"
                    @click="() => (model.roles = ['admin', 'wizard', 'user'])"
                  >
                    <span>Admin</span>
                  </v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <localization />
            <v-spacer />
            <v-btn color="primary" :loading="loading" @click="login">
              {{ $t("login.singIn") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Localization from "../widget/AppLocalization.vue";

export default {
  name: "SingIn",
  components: { Localization },
  data: () => ({
    loading: false,
    model: {
      username: "admin",
      password: "pass1",
      roles: ["user"],
    },
  }),
  methods: {
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
  },
};
</script>
