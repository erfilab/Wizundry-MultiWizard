<template>
  <v-app>
    <router-view />
<!--    <app-snackbar ref="vtoast" />-->
<!--    <div id="cursor-path">-->
<!--      <svg-->
<!--        viewBox="0 0 16.3 24.7"-->
<!--        class="cursor"-->
<!--      >-->
<!--        <path-->
<!--          stroke="#000"-->
<!--          stroke-linecap="round"-->
<!--          stroke-linejoin="round"-->
<!--          stroke-miterlimit="10"-->
<!--          d="M15.6 15.6L.6.6v20.5l4.6-4.5 3.2 7.5 3.4-1.3-3-7.2z"-->
<!--        />-->
<!--      </svg>-->
<!--    </div>-->
  </v-app>
</template>

<script>
// import AppSnackbar from "./views/widget/AppSnackbar.vue";
// import Cursor from "./views/components/MultiDoc/Cursor.vue";

export default {
  name: "App",
  // components: {AppSnackbar},
  mounted() {
    // this.$root.vtoast = this.$refs.vtoast;
  },
};
</script>

<!--<style>-->
<!--.cursor {-->
<!--  width: 20px;-->
<!--  transition: all ease;-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--}-->
<!--</style>-->
