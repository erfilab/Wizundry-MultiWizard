<template>
  <v-app>
    <router-view />
    <app-snackbar ref="vtoast" />
  </v-app>
</template>

<script>
import AppSnackbar from './views/widget/AppSnackbar.vue'

export default {
  name: 'App',
  components: { AppSnackbar },
  mounted () {
    this.$root.vtoast = this.$refs.vtoast
  }
};
</script>
