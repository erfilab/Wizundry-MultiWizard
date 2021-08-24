<template>
  <div>
    <github-corner class="github-corner" />
    <v-container class="container--fluid grid-list-md text-center">
    </v-container>
  </div>
</template>

<script>
import GithubCorner from '@/views/components/Dashboard/GithubCorner.vue';

export default {
  name: 'Dashboard',
  components: {
    GithubCorner
  },
};
</script>
