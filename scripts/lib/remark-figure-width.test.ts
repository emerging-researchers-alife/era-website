import { expect, test } from 'bun:test';
import { createPipeline } from './pipeline';

for (const separator of ['\n', '\n\n']) {
  test(`figure keeps image and consumes caption with ${separator.length} newlines`, async () => {
    const html = String(await createPipeline().process(`![Diagram](/diagram.svg)${separator}{.l-page caption="The cell's update"}`));
    expect(html).toContain('<figure class="l-page">');
    expect(html).toContain('<img src="/diagram.svg" alt="Diagram"');
    expect(html).toContain("<figcaption>The cell's update</figcaption>");
    expect(html).not.toContain('{.l-page');
    expect(html).not.toContain('<p><figure');
  });
}
test('inline image prose is preserved', async () => {
  const html = String(await createPipeline().process('Before ![Diagram](/diagram.svg) after.'));
  expect(html).toContain('Before <img');
  expect(html).toContain(' after.');
  expect(html).not.toContain('<figure');
});
