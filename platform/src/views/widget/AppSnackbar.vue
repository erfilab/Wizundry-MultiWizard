<template>
  <v-snackbar
    v-model="showSnackbar"
    :color="color"
    :timeout="timer"
    top
  >
    <v-icon left>
      {{ color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
    </v-icon>{{ message }}
  </v-snackbar>
</template>

<script>
export default {
  name: "Vtoast",
  data() {
    return{
      showSnackbar: false,
      message: '',
      color: 'success',
      icon: 'mdi-circle-check',
      timer: 2000
    }
  },
  methods:{
    show(data) {
      this.showSnackbar = true
      this.message = data.message || 'missing "message".'
      this.color = data.color || 'success'
      this.timer = data.timer || 2000
      this.icon = data.icon || 'mdi-circle-check'
    }
  }
}
</script>