/**
 * Custom remark plugin to transform :::details directives.
 *
 * Transforms:
 * ```
 * :::details{title="Full PyTorch Script"}
 * ```python
 * # Full code here
 * ```
 * :::
 * ```
 *
 * Into a <div data-expandable-code="..."> element that can be hydrated
 * by the ExpandableCode React component.
 */

import { visit } from 'unist-util-visit';
import type { Root, Code } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import type { Plugin } from 'unified';

interface ExpandableData {
  title: string;
  code: string;
  language: string;
  defaultOpen?: boolean;
}

export const remarkDetails: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      if (node.name !== 'details') return;

      // Get the title from attributes
      const title = node.attributes?.title || 'Show code';
      const defaultOpen = node.attributes?.open === 'true';

      // Find the code block inside
      let codeBlock: Code | null = null;
      for (const child of node.children) {
        if ((child as Code).type === 'code') {
          codeBlock = child as Code;
          break;
        }
      }

      if (!codeBlock) {
        // No code block found, skip
        return;
      }

      // Prepare the data for the React component
      const expandableData: ExpandableData = {
        title,
        code: codeBlock.value,
        language: codeBlock.lang || 'text',
        defaultOpen,
      };

      // Set up the HTML output
      const data = node.data || (node.data = {});

      // Transform to a div that can be hydrated
      data.hName = 'div';
      data.hProperties = {
        className: ['expandable-code-container'],
        'data-expandable-code': JSON.stringify(expandableData),
      };
    });
  };
};

export default remarkDetails;
