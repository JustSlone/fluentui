import { MakeStylesRenderer } from '../types';
import { RTL_PREFIX } from '../constants';

export interface MakeStylesDOMRenderer extends MakeStylesRenderer {
  insertionCache: Record<string, true>;
  index: number;

  styleElement: HTMLStyleElement;
}

const renderers = new WeakMap<Document, MakeStylesDOMRenderer>();
let lastIndex = 0;

/* eslint-disable guard-for-in */

export function createDOMRenderer(targetDocument: Document = document): MakeStylesDOMRenderer {
  const value: MakeStylesDOMRenderer | undefined = renderers.get(targetDocument);

  if (value) {
    return value;
  }

  const styleElement = targetDocument.createElement('style');

  styleElement.setAttribute('make-styles', 'RULE');
  targetDocument.head.appendChild(styleElement);

  const renderer: MakeStylesDOMRenderer = {
    insertionCache: {},
    index: 0,
    styleElement,

    id: `d${lastIndex++}`,
    insertDefinitions: function insertStyles(dir, definitions): string {
      let classes = '';

      for (const propName in definitions) {
        const definition = definitions[propName];
        // 👆 [className, css, rtlCSS?]

        const className = definition[0];
        const rtlCSS = definition[2];

        const ruleClassName = className && (dir === 'rtl' && rtlCSS ? RTL_PREFIX + className : className);

        if (ruleClassName) {
          // Should be done always to return classes even if they have been already inserted to DOM
          classes += ruleClassName + ' ';
        }

        const cacheKey = ruleClassName || propName;
        if (renderer.insertionCache[cacheKey]) {
          continue;
        }

        const css = definition[1];
        const ruleCSS = dir === 'rtl' ? rtlCSS || css : css;

        renderer.insertionCache[cacheKey] = true;
        try {
          if (renderer.styleElement.sheet instanceof CSSStyleSheet) {
            renderer.styleElement.sheet.insertRule(ruleCSS, renderer.index);
            renderer.index++;
          }
        } catch (e) {
          // We've disabled these warnings due to false-positive errors with browser prefixes
          if (process.env.NODE_ENV !== 'production' && !ignoreSuffixesRegex.test(ruleCSS)) {
            // eslint-disable-next-line no-console
            console.error(`There was a problem inserting the following rule: "${ruleCSS}"`, e);
          }
        }
      }

      return classes.slice(0, -1);
    },
  };

  renderers.set(targetDocument, renderer);

  return renderer;
}

export function resetDOMRenderer(targetDocument: Document = document): void {
  renderers.delete(targetDocument);
}

/**
 * Suffixes to be ignored in case of error
 */
const ignoreSuffixes = [
  '-moz-placeholder',
  '-moz-focus-inner',
  '-moz-focusring',
  '-ms-input-placeholder',
  '-moz-read-write',
  '-moz-read-only',
].join('|');
const ignoreSuffixesRegex = new RegExp(`:(${ignoreSuffixes})`);
