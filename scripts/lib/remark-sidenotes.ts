/**
 * Custom remark plugin to transform :::sidenote directives.
 *
 * Transforms:
 * ```
 * :::sidenote
 * This is a sidenote.
 * :::
 * ```
 *
 * Into an <aside class="sidenote"> element.
 */

import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

// Extended type for container directives from remark-directive
interface ContainerDirective {
  type: 'containerDirective';
  name: string;
  children: unknown[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

export const remarkSidenotes: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      if (node.name === 'sidenote') {
        const data = node.data || (node.data = {});
        // Transform to <aside class="sidenote">
        data.hName = 'aside';
        data.hProperties = {
          className: ['sidenote'],
          role: 'note',
        };
      }
    });
  };
};

export default remarkSidenotes;
