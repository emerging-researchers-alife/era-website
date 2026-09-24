import { createCA } from '../../src/components/nca/nca-ca';
import weights from '../../src/assets/nca/lizard.json';
const canvas = document.querySelector('canvas')!;
const gl = canvas.getContext('webgl', { alpha: true, preserveDrawingBuffer: true })!;
const ca = createCA(gl, weights, [96, 96]);
ca.setTransparent(true);
let steps = 0;
function frame() {
  for (let i = 0; i < 8; i++) ca.step();
  ca.draw();
  steps += 8;
  if (steps < 320) requestAnimationFrame(frame);
  else {
    document.querySelector('button')!.disabled = false;
    document.querySelector('p')!.textContent = '320 simulation steps. Ready to save.';
  }
}
requestAnimationFrame(frame);
document.querySelector('button')!.onclick = async () => {
  ca.draw();
  const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
  const response = await fetch('/save-poster', { method: 'POST', body: blob });
  document.querySelector('p')!.textContent = response.ok ? 'Poster saved.' : 'Save failed.';
};
