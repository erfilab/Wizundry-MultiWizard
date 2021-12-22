import {getMarkRange, Mark, mergeAttributes} from '@tiptap/vue-2';
import {Plugin, TextSelection} from 'prosemirror-state';

export const Note = Mark.create({
  name: 'note',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      note: {
        default: null,
        parseHTML: (el) => (el).getAttribute('data-note'),
        renderHTML: (attrs) => ({'data-note': attrs.note}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-note]',
        getAttrs: (el) => !!(el).getAttribute('data-note')?.trim() && null,
      },
    ];
  },

  renderHTML({HTMLAttributes}) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setNote: (note) => ({commands}) => commands.setMark('note', {note}),
      toggleNote: () => ({commands}) => commands.toggleMark('note'),
      unsetNote: () => ({commands}) => commands.unsetMark('note'),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleClick(view, pos) {
            const {schema, doc, tr} = view.state;

            const range = getMarkRange(doc.resolve(pos), schema.marks.note);

            if (!range) return false;

            const [$start, $end] = [doc.resolve(range.from), doc.resolve(range.to)];

            view.dispatch(tr.setSelection(new TextSelection($start, $end)));

            return true;
          },
        },
      }),
    ];
  },
})
