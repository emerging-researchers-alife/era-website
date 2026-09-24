import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { rehype } from 'rehype';
import { visit } from 'unist-util-visit';
import type { Article } from '../../src/content/types';

const root = resolve(process.argv[2] || 'dist');
const errors: string[] = [];
const pages = new Map<string, { ids: Set<string>; refs: string[] }>();
for (const file of new Bun.Glob('*.json').scanSync(`${root}/articles`)) {
  const article: Article = await Bun.file(`${root}/articles/${file}`).json();
  const ids = new Set<string>();
  const refs: string[] = [];
  const tree = rehype().parse(article.content);
  visit(tree, 'element', node => {
    if (node.properties.id) ids.add(String(node.properties.id));
    if (node.tagName === 'img' && node.properties.src) refs.push(String(node.properties.src));
    if (node.tagName === 'a' && node.properties.href) refs.push(String(node.properties.href));
  });
  if (article.thumbnail) refs.push(article.thumbnail);
  pages.set(`/resources/${file.replace(/\.json$/, '')}`, { ids, refs });
}
for (const [page, { refs }] of pages) {
  for (const ref of refs) {
    const url = new URL(ref, `https://era.invalid${page}`);
    if (url.origin !== 'https://era.invalid') continue;
    const targetPage = pages.get(url.pathname);
    const path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!path.startsWith(`${root}/`) && path !== root) {
      errors.push(`${page}: invalid path ${ref}`);
      continue;
    }
    if (!existsSync(path) && !existsSync(`${path}/index.html`)) errors.push(`${page}: missing ${ref}`);
    if (url.hash && targetPage && !targetPage.ids.has(decodeURIComponent(url.hash.slice(1)))) {
      errors.push(`${page}: missing heading ${ref}`);
    }
  }
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Article assets and internal links checked across ${pages.size} published articles.`);
