<template>
  <div>
    <github-corner class="github-corner" />
    <v-container class="container--fluid grid-list-md">
      <v-row dense style="height: 5vh" />
      <v-row dense>
        <v-col cols="12">
          <app-widget title="Create Experiment">
            <v-btn slot="widget-header-action" icon>
              <v-icon>mdi-flare</v-icon>
            </v-btn>
            <all-experiments slot="widget-content" />
          </app-widget>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import GithubCorner from "@/views/components/Dashboard/GithubCorner.vue";
import AppWidget from "@/views/widget/AppWidget.vue";
import AllExperiments from "@/views/components/Admin/AllExperiments.vue";

export default {
  name: "Dashboard",
  components: {
    GithubCorner,
    AppWidget,
    AllExperiments,
  },
  watch: {
    // $route(to, from) {
    //   if (from.path === "/multidoc") {

    //   }
    // },
  },
  mounted() {
    // this.$router.go(0)
    // window.location.reload()
  },
};
</script>
