<template>
  <div>
    <v-container class="container--fluid grid-list-md">
      <div v-if="userInfo.dominant">
        <dominant-wizard-editor
          :user-info="userInfo"
          :trial-info="trialInfo"
        />
      </div>
      <div>
        <div v-if="currentRole === 'wizard'">
          <normalWizardEditor
            :selectedTasks="currentTasks"
            :user-info="userInfo"
            :trial-info="trialInfo"
          />
<!--          <dictation-wizard-editor-->
<!--            v-if="currentTasks.includes('DICT')"-->
<!--            :user-info="userInfo"-->
<!--            :trial-info="trialInfo"-->
<!--          />-->
<!--          <label-wizard-editor-->
<!--            v-if="currentTasks.includes('PLABEL') || currentTasks.includes('CLABEL')"-->
<!--            :user-info="userInfo"-->
<!--            :trial-info="trialInfo"-->
<!--          />-->
<!--          <note-wizard-editor-->
<!--            v-if="currentTasks.includes('NOTE') || currentTasks.includes('HIGH')"-->
<!--            :user-info="userInfo"-->
<!--            :trial-info="trialInfo"-->
<!--          />-->
        </div>
        <div v-if="currentRole === 'user'">
          <user-editor
            :user-info="userInfo"
            :trial-info="trialInfo"
          />
        </div>
      </div>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
// import dictationWizardEditor from "./Editor/dictationWizardEditor";
// import labelWizardEditor from "./Editor/labelWizardEditor";
// import noteWizardEditor from "./Editor/noteWizardEditor";
import userEditor from "./Editor/userEditor";
import dominantWizardEditor from "./Editor/dominantWizardEditor";
import normalWizardEditor from "./Editor/normalWizardEditor";

export default {
  name: "Editor",
  components: {
    // dictationWizardEditor,
    // labelWizardEditor,
    // noteWizardEditor,
    userEditor,
    dominantWizardEditor,
    normalWizardEditor
  },
  data() {
    return {
      currentRole: [],
      currentTasks: [],
    }
  },
  computed: {
    ...mapGetters([
      "userInfo",
      "trialInfo"
    ])
  },
  created() {
    console.log(this.userInfo, this.trialInfo)
    this.currentTasks = this.userInfo.selectedTasks
    this.currentRole = this.userInfo.userRole
  }
}
</script>

<style scoped>

</style>
