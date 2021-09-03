<template>
  <v-card
    flat
    class="pa-3"
  >
    <v-card-title>
      <span class="text-h5">Create Experiment</span>
    </v-card-title>
    <v-card-text>
      <create-exp-form />
    </v-card-text>
  </v-card>
</template>

<script>
import CreateExpForm from "./components/CreateExpForm.vue";
export default {
  name: "CreateExperiment",
  components: {
    CreateExpForm,
  },
  data() {
    return {
      //
    };
  },
};
</script>