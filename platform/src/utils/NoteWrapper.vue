<template>
  <node-view-wrapper
    ref="notej"
    class="note"
    :class="{show: isNoteOpen}"
    spellcheck="false"
    contenteditable="false"
  >
    <node-view-content
      class="content"
      contenteditable="false"
      @click="openNote"
    />

    <section
      class="popup"
      :class="{show: isNoteOpen}"
    >
      {{ node.attrs.note }}

      <button
        class="close-button"
        @click="closeNote"
      >
        X
      </button>
    </section>
  </node-view-wrapper>
</template>

<script>
import {NodeViewWrapper, NodeViewContent, nodeViewProps} from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,
  data() {
    return {
      isNoteOpen: false,
    }
  },
  methods: {
    closeNote(){
      this.isNoteOpen.value = false
    },
    openNote() {
      this.isNoteOpen.value = true
    }
  },
}
</script>


<style lang="scss">
.note {
  .content {
    display: inline;
    cursor: pointer;
    background: #88b957;
  }
  .popup {
    position: absolute;
    display: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    padding: 0.5em;
    z-index: 1000;
    background: white;
    &.show {
      display: flex;
    }
    .close-button {
      align-self: flex-end;
    }
  }
}
</style>
