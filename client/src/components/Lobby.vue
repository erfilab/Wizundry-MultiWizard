<template>
  <div>
    <h1>Lobby</h1>
    <pre>
      {{getCurrentUser}}
    </pre>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
export default {
  name: "Lobby",
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters('user', ['getCurrentUser']),
  },
  methods: {

  },
  mounted() {
    console.log(this.getCurrentUser)
  }
}
</script>

<style scoped>

</style>