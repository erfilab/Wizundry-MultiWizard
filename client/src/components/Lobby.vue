<template>
  <div>
    <h1>Lobby</h1>
    <v-row class="mb-5">
      <v-card>
        <v-card-title>{{ `${getCurrentUser.email} - ${getCurrentUser.name} - ${getCurrentUser.role}` }}</v-card-title>
      </v-card>
    </v-row>

    <v-row>
      <v-data-table
          v-show="getCurrentUser.role !== 'participant'"
          :headers="headers"
          :items="projectUserLists"
          :items-per-page="20"
          class="elevation-1"
      ></v-data-table>

      <v-col
          v-for="(item, i) in projectUserLists"
          :key="i"
          md="6" sm="12" lg="4"
      >
        <v-card color="#385F73">
          <v-card-title class="text-h5">
            <v-chip color="cyan" label small text-color="white" class="mr-1">{{ item.id }}</v-chip>
            {{ item.project_name }}
          </v-card-title>

          <v-card-text>
            <p>
              <v-icon class="mr-2">mdi-email</v-icon>
              Email: {{ item.email }}
            </p>
            <p>
              <v-icon class="mr-2">mdi-lock</v-icon>
              Password: {{ item.password }}
            </p>
            <p>
              <v-icon class="mr-2">mdi-account</v-icon>
              Participant: {{ item.participant }}
            </p>
            <v-icon class="mr-2">mdi-clock</v-icon>
            <v-chip outlined>{{ dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</v-chip>
          </v-card-text>

          <v-card-actions>
            <v-row>
              <v-spacer/>
              <v-col cols="3">
                <v-btn
                    class="mt-2 mb-2"
                    outlined
                    rounded
                    small
                    @click="startProject(item)"
                >
                  START >
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';

export default {
  name: "Lobby",
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
