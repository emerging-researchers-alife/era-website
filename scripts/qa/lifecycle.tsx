import { createRoot } from 'react-dom/client';
import { NCACanvas } from '../../src/components/nca/NCACanvas';
import weights from '../../src/assets/nca/lizard.json';
const root = createRoot(document.querySelector('#fixture')!);
const output = document.querySelector('#results')!;
const button = document.querySelector<HTMLButtonElement>('#run')!;
const wait = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms));
async function until(condition: () => boolean) {
  const deadline = performance.now() + 10000;
  while (!condition() && performance.now() < deadline) await wait(50);
}
let draws = 0, created = 0, deleted = 0;
for (const [method, record] of [
  ['drawArrays', () => draws++], ['createTexture', () => created++], ['deleteTexture', () => deleted++],
] as const) {
  const original = WebGLRenderingContext.prototype[method];
  (WebGLRenderingContext.prototype as any)[method] = function(...args: unknown[]) {
    record(); return (original as Function).apply(this, args);
  };
}
button.onclick = async () => {
  button.disabled = true;
  const results: string[] = [];
  let ready = 0, errors = 0;
  const check = (condition: boolean, label: string) => {
    results.push(`${condition ? 'PASS' : 'FAIL'} ${label}`);
    output.textContent = results.join('\n');
    if (!condition) throw new Error(`${label}; visibility=${document.visibilityState}; draws=${draws}; textures=${created}; ready=${ready}; errors=${errors}`);
  };
  const render = (width = 96, paused = false, model: typeof weights | string = weights) => root.render(
    <NCACanvas width={width} height={width} weights={model} paused={paused}
      onReady={() => ready++} onError={() => errors++} />
  );
  try {
    render(); await until(() => ready === 1 || errors > 0);
    check(ready === 1 && draws > 0, 'Initial mount draws and signals ready once');
    const initialTextures = created;
    render(); await wait();
    check(created === initialTextures && ready === 1, 'New callback identities do not recreate GPU state');
    render(72); await until(() => ready === 2 || errors > 0);
    const afterResize = draws;
    await wait();
    check(ready === 2 && draws > afterResize, 'Changing grid size restarts the animation');
    check(deleted === 8, 'Resize disposes all eight old textures');
    render(72, true); await wait();
    const pausedDraws = draws;
    await wait();
    check(draws === pausedDraws, 'Pause stops all GPU drawing');
    render(72, false); await wait();
    check(draws > pausedDraws, 'Resume continues drawing');
    document.querySelector('canvas')!.getContext('webgl')!.getExtension('WEBGL_lose_context')!.loseContext();
    await wait();
    const lostDraws = draws;
    await wait();
    check(errors === 1 && draws === lostDraws, 'Context loss reports failure once and stops drawing');
    root.render(null); await wait();
    check(created === deleted, 'Unmount releases all allocated textures');
    render(96, false, '/missing-weights.json'); await wait();
    check(errors === 2, 'Failed weights request reports failure');
    root.render(null); await wait();
    results.push('All lifecycle checks passed.');
  } catch (error) { results.push(String(error)); }
  output.textContent = results.join('\n');
  button.disabled = false;
};
