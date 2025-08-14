import type { FoundDate } from '@/types/found-dates';
import { Extensions } from '@harbour-enterprises/superdoc/super-editor';
import type { Extension } from 'node_modules/@harbour-enterprises/superdoc/dist/super-editor/core';
import type { HTMLAttributes } from 'react';

const { Attribute } = Extensions;

export const DateMatchesMarkup: Extension = Extensions.Mark.create({
  name: 'dateMatches',

  addOptions() {
    return {
      'data-id': this.name,
      htmlAttributes: {
        class: 'datematch-markup-highlight',
      },
    };
  },

  addAttributes() {
    return {
      'data-location': {
        default: null,
      },
      'data-is-selected': {
        default: false,
      }
    };
  },

  parseDom() {
    return false;
  },

  renderDOM({ htmlAttributes }: { htmlAttributes: HTMLAttributes<HTMLElement> }) {
    return ['mark', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addCommands() {
    return {
      markupText: (textArray: FoundDate[], selectedIndex: number) => ({ state, dispatch }) => {
        const tr = state.tr;

        textArray.forEach(({ found_text, context, location }, dateIndex) => {
          state.doc.descendants((node, pos) => {
            if (node.isText && node.text.includes(found_text)) {
              const index = node.text.indexOf(found_text);
              const from = pos + index;
              const to = from + found_text.length;

              if (state.doc.textBetween(from - 20, to + 20).includes(context.slice(-15))) {
                tr.addMark(from, to, this.type.create({
                  'data-location': location,
                  'data-is-selected': selectedIndex === dateIndex,
                }));
              }
            }
          });
        });

        if (dispatch) dispatch(tr);
        return true;
      },
    };
  },
});
