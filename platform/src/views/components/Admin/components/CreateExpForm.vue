<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-text-field
      v-model="projectName"
      :counter="10"
      :rules="nameRules"
      label="Project Name"
      required
    />
    <v-autocomplete
      v-model="experimentType"
      :items="experimentTypes"
      auto-select-first
      clearable
      label="Experiment Type"
    />
    <v-autocomplete
      v-model="divisionMethod"
      :items="divisionMethods"
      auto-select-first
      clearable
      label="Labor Division Method"
    />

    <h6>Choose Features</h6>
    <v-chip-group
      v-model="features"
      column
      multiple
      active-class="primary--text"
    >
      <v-chip
        filter
        outlined
      >
        Multiple Cursor
      </v-chip>
      <v-chip
        filter
        outlined
      >
        Line Break
      </v-chip>
      <v-chip
        filter
        outlined
      >
        Run-time Content
      </v-chip>
      <v-chip
        filter
        outlined
      >
        Highlight Keyword
      </v-chip>
      <v-chip
        filter
        outlined
      >
        Highlight Conjunction Word
      </v-chip>
    </v-chip-group>
    <v-checkbox
      v-model="confirm"
      :rules="[(v) => !!v || 'You must agree to continue!']"
      label="Do you agree to let experimenter collect the data?"
      required
    />
    <div class="text-right">
      <v-btn
        outlined
        color="error"
        class="mr-4"
        @click="reset"
      >
        Reset Form
      </v-btn>
      <v-btn
        outlined
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="createNew"
      >
        Create
      </v-btn>
    </div>
  </v-form>
</template>

<script>
import { mapGetters } from 'vuex';
import Highlight from '@tiptap/extension-highlight';

export default {
  components: {},
  data: () => ({
    valid: true,
    projectName: `Test_${new Date()
      .toISOString()
      .substr(0, 16)
      .replace("T", "_")}`,
    nameRules: [
      (v) => !!v || "Project Name is required",
    ],
    confirm: false,
    features: [0, 1, 2, 3],
    divisionMethod: "Structure",
    divisionMethods: [
      "Function",
      "Content",
      "Structure",
      "Style",
      "Layout",
      "Composition",
    ],
    experimentType: "Multi-Doc",
    experimentTypes: ["Multi-Doc", "Single-Doc", "Multi-Chat", "Single-Chat"],
  }),
  computed: {
    ...mapGetters([
      "userInfo",
      "roles",
    ]),
  },
  methods: {
    async createNew() {
      if (this.$refs.form.validate()) {
        await this.$store.dispatch("CreateNewExperiment", {
          username: this.userInfo.username,
          project_name: this.projectName,
          type: this.experimentType,
          division: this.divisionMethod,
          features: JSON.stringify(this.features),
          confirm: this.confirm,
        });
        this.$router.push({ name: "Dashboard" });
      }
    },
    reset() {
      this.$refs.form.reset();
    },
  },
};
</script>

<style>
</style>