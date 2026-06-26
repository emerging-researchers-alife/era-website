/**
 * Custom remark plugin to transform :::nca directives.
 *
 * Transforms:
 * ```
 * :::nca{weights="lizard" width=96 height=96}
 * Optional caption text here
 * :::
 * ```
 *
 * Into a <div data-nca="..."> element that can be hydrated
 * by the NCADemo React component.
 */

import { visit } from 'unist-util-visit';
import type { Root, Parent, Text } from 'mdast';
import type { Plugin } from 'unified';

// Extended type for container directives from remark-directive
interface ContainerDirective extends Parent {
  type: 'containerDirective';
  name: string;
  attributes?: Record<string, string>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: unknown[];
  };
}

export interface NCAConfig {
  weights: string;
  width: number;
  height: number;
  caption?: string;
}

/**
 * Extract caption text from directive children
 */
function extractCaption(node: ContainerDirective): string | undefined {
  const textParts: string[] = [];

  for (const child of node.children) {
    if (child.type === 'paragraph') {
      for (const inline of (child as Parent).children) {
        if ((inline as Text).type === 'text') {
          textParts.push((inline as Text).value);
        }
      }
    }
  }

  const caption = textParts.join(' ').trim();
  return caption || undefined;
}

export const remarkNCA: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      if (node.name !== 'nca') return;

      const attrs = node.attributes || {};

      // Parse config from attributes
      const config: NCAConfig = {
        weights: attrs.weights || 'lizard',
        width: parseInt(attrs.width || '96', 10),
        height: parseInt(attrs.height || '96', 10),
        caption: extractCaption(node),
      };

      // Set up the HTML output
      const data = node.data || (node.data = {});

      // Transform to a div that can be hydrated
      data.hName = 'div';
      data.hProperties = {
        className: ['nca-demo-container'],
        'data-nca': JSON.stringify(config),
      };

      // Clear children - caption is now in data-nca
      node.children = [];
    });
  };
};

export default remarkNCA;
