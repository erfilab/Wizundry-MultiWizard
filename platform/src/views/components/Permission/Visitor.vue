<template>
  <app-center>
    <template v-slot:page>
      <v-col class="text-h1">
        Visitor
      </v-col>
    </template>
  </app-center>
</template>

<script>
import AppCenter from '@/views/widget/AppCenter.vue';

export default {
  name: 'Visitor',
  components: {
    AppCenter,
  },
};
</script>
