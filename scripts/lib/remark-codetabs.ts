/**
 * Custom remark plugin to transform :::codetabs directives.
 *
 * Transforms:
 * ```
 * :::codetabs
 * ```python {title="PyTorch"}
 * import torch
 * ```
 *
 * ```python {title="MLX"}
 * import mlx.core as mx
 * ```
 *
 * ```python {title="JAX"}
 * import jax.numpy as jnp
 * ```
 * :::
 * ```
 *
 * Into a <div data-codetabs="..."> element with serialized code blocks
 * that can be hydrated by the CodeTabs React component.
 */

import { visit } from 'unist-util-visit';
import type { Root, Code, Parent } from 'mdast';
import type { Plugin } from 'unified';

// Framework mapping from title to framework ID
const FRAMEWORK_MAP: Record<string, string> = {
  pytorch: 'pytorch',
  torch: 'pytorch',
  mlx: 'mlx',
  jax: 'jax',
  flax: 'jax',
};

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

interface CodeBlock {
  framework: string;
  code: string;
}

/**
 * Parse the title attribute from a code block's meta string.
 * Supports formats like: title="PyTorch" or {title="PyTorch"}
 */
function parseTitle(meta: string | null | undefined): string | null {
  if (!meta) return null;

  // Match title="value" or title='value'
  const match = meta.match(/title\s*=\s*["']([^"']+)["']/);
  return match ? match[1] : null;
}

/**
 * Determine framework from title string
 */
function getFramework(title: string): string {
  const normalized = title.toLowerCase().trim();
  return FRAMEWORK_MAP[normalized] || normalized;
}

export const remarkCodetabs: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      if (node.name !== 'codetabs') return;

      // Extract code blocks from children
      const codeBlocks: CodeBlock[] = [];

      for (const child of node.children) {
        if ((child as Code).type === 'code') {
          const codeNode = child as Code;
          const title = parseTitle(codeNode.meta);
          if (title) {
            codeBlocks.push({
              framework: getFramework(title),
              code: codeNode.value,
            });
          }
        }
      }

      if (codeBlocks.length === 0) {
        // No valid code blocks found, skip
        return;
      }

      // Set up the HTML output
      const data = node.data || (node.data = {});

      // Transform to a div that can be hydrated
      data.hName = 'div';
      data.hProperties = {
        className: ['code-tabs-container'],
        'data-codetabs': JSON.stringify({ blocks: codeBlocks }),
      };

      // Create a noscript fallback with all code blocks visible
      // This is handled by showing the first code block by default
      // The actual code will be highlighted by rehype-prism-plus
      // and hydrated by the React component on the client
    });
  };
};

export default remarkCodetabs;
