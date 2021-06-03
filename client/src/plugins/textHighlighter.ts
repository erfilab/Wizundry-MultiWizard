import { Extension } from '@tiptap/core'
import { InputRule } from 'prosemirror-inputrules'

export const TextHighlighter = Extension.create({
    username: 'textHighlighter',

    addInputRules() {
        return [
            // new InputRule(/ $/, ''),
            new InputRule(/:'-\) $/, '😂 '),
        ]
    },
})
