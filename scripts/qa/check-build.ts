import { strict as assert } from 'node:assert';
import { join } from 'node:path';
const dir = process.argv[2] || 'dist';
const home = await Bun.file(join(dir, 'index.html')).text();
assert.match(home, /<h1[^>]*>Emerging Researchers in Artificial Life<\/h1>/);
assert.match(home, /href="\/resources"[^>]*>Explore Resources<\/a>/);
assert.match(home, /href="\/community"[^>]*>Join Community<\/a>/);
assert.match(home, /lizard-poster-[^"/]+\.png/);
assert.ok(!home.includes('/Users/'), 'No build-machine paths in homepage HTML');
assert.ok(!home.includes('qa-instrument'), 'No QA harness in production');
assert.ok(!(await Bun.file(join(dir, 'resources/index.html')).text()).includes('era-hero-title'), 'Other route shells do not show the homepage');
let cssBytes = 0;
for (const path of new Bun.Glob('*.css').scanSync(dir)) cssBytes += Bun.file(join(dir, path)).size;
assert.ok(cssBytes < 200_000, `Global CSS remains small (${cssBytes} bytes)`);
const math = await Bun.file(join(dir, 'vendor/katex/katex.min.css')).text();
for (const [, font] of math.matchAll(/url\((fonts\/[^)]+)\)/g)) {
  assert.ok(await Bun.file(join(dir, 'vendor/katex', font!)).exists(), `Math font exists: ${font}`);
}
console.log(`Build checks passed: static homepage, working anchors, poster, route isolation, ${cssBytes} CSS bytes, all math font files.`);
