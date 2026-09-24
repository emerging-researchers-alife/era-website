/**
 * Custom remark plugin to handle figure width classes and captions.
 *
 * Transforms images with trailing attribute syntax:
 * ```
 * ![Alt text](./image.png)
 * {.l-page caption="Figure 1: Description"}
 * ```
 *
 * Into a <figure> element with appropriate width class and figcaption.
 */

import { visit } from 'unist-util-visit';
import type { Root, Paragraph } from 'mdast';
import type { Plugin } from 'unified';

// Valid layout classes
const LAYOUT_CLASSES = ['l-body', 'l-outset', 'l-page', 'l-screen', 'l-gutter'];

interface FigureData {
  className?: string;
  caption?: string;
}

/**
 * Parse attribute string like `{.l-page caption="Figure 1"}`
 */
function parseAttributes(text: string): FigureData | null {
  const match = text.trim().match(/^\{([^}]+)\}$/);
  if (!match) return null;

  const inner = match[1];
  if (!inner) return null;
  const result: FigureData = {};

  // Extract class (e.g., .l-page)
  const classMatch = inner.match(/\.([a-z-]+)/);
  if (classMatch?.[1] && LAYOUT_CLASSES.includes(classMatch[1])) {
    result.className = classMatch[1];
  }

  // Extract caption (e.g., caption="...")
  const captionMatch = inner.match(/caption=(["'])(.*?)\1/);
  if (captionMatch) {
    result.caption = captionMatch[2];
  }

  return Object.keys(result).length > 0 ? result : null;
}

export const remarkFigureWidth: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (!parent || index === undefined) return;

      // Only standalone images can become block figures. Leave inline images alone.
      const imageNode = node.children[0];
      if (imageNode?.type !== 'image') return;
      let figureData: FigureData | null = null;
      if (node.children.length === 2 && node.children[1]?.type === 'text') {
        figureData = parseAttributes(node.children[1].value);
      } else if (node.children.length === 1) {
        const nextNode = parent.children[index + 1];
        if (nextNode?.type === 'paragraph' && nextNode.children.length === 1) {
          const text = nextNode.children[0];
          if (text?.type === 'text') figureData = parseAttributes(text.value);
          if (figureData) parent.children.splice(index + 1, 1);
        }
      }
      if (!figureData) return;

      // Transform the containing paragraph, keeping a real image inside it.
      // Renaming the image itself to figure discards its visible content.
      node.data = {
        ...node.data,
        hName: 'figure',
        hProperties: { className: [figureData.className ?? 'l-body'] },
        hChildren: [
          {
            type: 'element', tagName: 'img',
            properties: {
              src: imageNode.url, alt: imageNode.alt ?? '',
              ...(imageNode.title ? { title: imageNode.title } : {}),
              loading: 'lazy', decoding: 'async',
            },
            children: [],
          },
          ...(figureData.caption ? [{
            type: 'element' as const, tagName: 'figcaption', properties: {},
            children: [{ type: 'text' as const, value: figureData.caption }],
          }] : []),
        ],
      };
    });
  };
};

export default remarkFigureWidth;
