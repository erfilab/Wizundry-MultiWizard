<template>
  <v-app>
    <v-main>
      <NavBar />
      <v-row>
        <Testeditor projectPath="project1" docName="doc1"/>
        <Testeditor projectPath="project1" docName="doc2"/>
        <Testeditor projectPath="project2" docName="doc1"/>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "@/components/NavBar";
import Testeditor from "@/components/testeditor";

export default {
  name: 'App',

  components: {
    NavBar,
    Testeditor,
  },

  data: () => ({
  }),
};
</script>
