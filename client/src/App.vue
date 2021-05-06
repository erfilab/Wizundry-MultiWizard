<template>
  <v-app>
    <v-main>
      <NavBar />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "@/components/NavBar";

export default {
  name: 'App',

  components: {
    NavBar,
  },

  data: () => ({
  }),
};
</script>
