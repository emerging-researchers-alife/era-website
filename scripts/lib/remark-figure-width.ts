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
import type { Root, Paragraph, Image, Text } from 'mdast';
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
  const result: FigureData = {};

  // Extract class (e.g., .l-page)
  const classMatch = inner.match(/\.([a-z-]+)/);
  if (classMatch && LAYOUT_CLASSES.includes(classMatch[1])) {
    result.className = classMatch[1];
  }

  // Extract caption (e.g., caption="...")
  const captionMatch = inner.match(/caption=["']([^"']+)["']/);
  if (captionMatch) {
    result.caption = captionMatch[1];
  }

  return Object.keys(result).length > 0 ? result : null;
}

export const remarkFigureWidth: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (!parent || index === undefined) return;

      // Check if this paragraph contains only an image
      const children = node.children;
      if (children.length === 0) return;

      // Find image node
      const imageIndex = children.findIndex((child) => child.type === 'image');
      if (imageIndex === -1) return;

      const imageNode = children[imageIndex] as Image;

      // Check if there's attribute text after the image
      // It could be in the same paragraph as trailing text, or in the next paragraph
      let figureData: FigureData | null = null;

      // Check for trailing text in same paragraph
      if (imageIndex < children.length - 1) {
        const nextChild = children[imageIndex + 1];
        if (nextChild.type === 'text') {
          const textNode = nextChild as Text;
          const lines = textNode.value.split('\n');
          for (const line of lines) {
            const parsed = parseAttributes(line);
            if (parsed) {
              figureData = parsed;
              break;
            }
          }
        }
      }

      // Check next sibling paragraph for attributes
      if (!figureData && parent.children && index + 1 < parent.children.length) {
        const nextNode = parent.children[index + 1] as Paragraph;
        if (nextNode.type === 'paragraph' && nextNode.children.length === 1) {
          const textChild = nextNode.children[0];
          if (textChild.type === 'text') {
            const parsed = parseAttributes((textChild as Text).value);
            if (parsed) {
              figureData = parsed;
              // Remove the attribute paragraph
              parent.children.splice(index + 1, 1);
            }
          }
        }
      }

      // If we found figure data, transform the image
      if (figureData) {
        // Add data to the image node for rehype to pick up
        const data = (imageNode as unknown as { data?: Record<string, unknown> }).data ||
          ((imageNode as unknown as { data: Record<string, unknown> }).data = {});

        // Store figure info for custom rehype handler
        data.hName = 'figure';
        data.hProperties = {
          className: figureData.className ? [figureData.className] : [],
        };

        // If there's a caption, we need to handle it specially
        if (figureData.caption) {
          data.figcaption = figureData.caption;
        }
      }
    });
  };
};

export default remarkFigureWidth;
