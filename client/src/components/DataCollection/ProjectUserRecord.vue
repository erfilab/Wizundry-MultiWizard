<template>
  <v-container fluid>
    <v-row>
      <v-data-table
          v-show="getCurrentUser.role !== 'participant'"
          :headers="headers"
          :items="projectUserLists"
          :items-per-page="20"
          class="elevation-1"
      ></v-data-table>
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';

export default {
  name: "ProjectUserRecord",
  data() {
    return {
      headers: [
        {text: 'ID', value: 'id'},
        {text: 'Project Name', value: 'project_name'},
        {text: 'Firebase UID', align: 'start', value: 'uid'},
        {text: 'Email', value: 'email'},
        {text: 'Password', value: 'password'},
        {text: 'Role', value: 'role'},
        {text: 'Creator', value: 'creator'},
        {text: 'Participant', value: 'participant'},
        {text: 'Created Time', value: 'createdAt'}

      ],
    }
  },
  computed: {
    ...mapGetters('user', ['getCurrentUser', 'projectUserLists']),
  },
  methods: {
    ...mapActions('user', ['fetchAllProjectsAndUsers']),
    startProject(item) {
      this.$router.push({name: 'text', params: {projectInfo: item}});
    }
  },
  async mounted() {
    await this.fetchAllProjectsAndUsers().catch(console.error);
  }
}
</script>

<style scoped>

</style>
