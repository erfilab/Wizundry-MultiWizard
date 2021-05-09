import { Extension } from '@tiptap/core'
import { InputRule } from 'prosemirror-inputrules'

export const TextHighlighter = Extension.create({
    name: 'textHighlighter',

    addInputRules() {
        return [
            // new InputRule(/ $/, ''),
            new InputRule(/:'-\) $/, '😂 '),
        ]
    },
})
