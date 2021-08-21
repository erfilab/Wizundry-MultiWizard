<template>
  <v-row justify="center">
    <v-dialog v-model="show" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          Direction
        </v-card-title>
        <v-card-text>
          <v-row>
            <div class="ml-4 mt-2">
              In this scenario, you need to respond user’s questions.
              Fortunately, Speech recognition tool is available while microphone
              is opening. It will avoid the problem of your forgetting. There
              some tasks for you and your partner:
            </div>
          </v-row>
          <v-row>
            <div class="ml-4 font-italic font-weight-bold">
              you should make a devision with your partner
            </div>
          </v-row>
          <v-row>
            <v-icon class="ml-4 mt-2" color="#5DBAB9" style="height:30px">
              mdi-account
            </v-icon>
            <v-textarea
              class="mt-2 mr-6 mb-n4"
              rows="1"
              outlined
              auto-grow
              value="1. decide the final output content"
            />
          </v-row>
          <v-row>
            <v-icon class="ml-4" color="#CC6E6E" style="height:30px">
              mdi-account
            </v-icon>
            <v-textarea
              class="mr-6"
              rows="1"
              outlined
              auto-grow
              value="1. take the charge of the microphone (open/close)"
            />
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click.stop="show = false">
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: "TipsDialog",
  props: {
    value: Boolean,
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
};
</script>

<style></style>
