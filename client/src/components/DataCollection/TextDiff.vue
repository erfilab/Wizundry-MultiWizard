<template>
  <v-row>
    <v-sheet
        class="overflow-y-auto"
        max-height="550"
        max-width="450"
    >
      <v-col>
        <v-data-table
            :headers="headers"
            :items="logs"
            item-key="logs.newContent"
            sort-by="timestamp"
            group-by="type"
            class="elevation-1"
            show-group-by
            @click:row="setSelectedContent"
            :footer-props="{
          itemsPerPageOptions: [50, 100, 300],
        }"
        ></v-data-table>
      </v-col>
    </v-sheet>
    <v-col class="ml-3" style="max-width: 60%">
      <v-sheet
          class="overflow-y-auto"
          max-height="250"
          max-width="100%"
      >
        <h5>Text Difference</h5>
        <p id="display" style="font-size: 20px"></p>
      </v-sheet>
<!--      <hr>-->
      <v-textarea class="mt-5" label="New Content" disabled :value="selectedNewContent"/>
      <v-textarea label="Last Content" disabled :value="selectedLastContent"/>
    </v-col>
  </v-row>
</template>

<script>
import Diff from 'vue-jsdiff';

export default {
  name: "TextDiff",
  props: {
    logs: Array
  },
  data() {
    return {
      headers: [
        {text: 'Type', value: 'type'},
        {text: 'User Name', value: 'username', groupable: false},
        {text: 'User Role', value: 'userRole', groupable: false, align: 'right'},
        {text: 'Timestamp ⏰', groupable: false, value: 'timestamp', align: 'right'},
      ],
      selectedLastContent: "",
      selectedNewContent: "",
      comparisonDiff: null,
    }
  },
  methods: {
    setSelectedContent(e) {
      this.selectedLastContent = e.lastContent;
      this.selectedNewContent = e.newContent;
      // console.log(Diff.diffChars(this.selectedLastContent, this.selectedNewContent))
      let span = null;
      const diff = Diff.diffChars(this.selectedLastContent, this.selectedNewContent),
          display = document.getElementById('display'),
          fragment = document.createDocumentFragment();

      diff.forEach((part) => {
        const color = part.added ? 'green' :
            part.removed ? 'red' : 'grey';
        span = document.createElement('span');
        span.style.color = color;
        span.appendChild(document
            .createTextNode(part.value));
        fragment.appendChild(span);
      });
      while (display.firstChild) display.removeChild(display.firstChild)
      display.appendChild(fragment);
    }
  }
}
</script>

<style scoped>

</style>
