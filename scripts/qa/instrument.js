// Review-only instrumentation injected by serve.ts, never shipped.
(() => {
  const params = new URLSearchParams(location.search);
  const counters = { draws: 0, texturesCreated: 0, texturesDeleted: 0, programsCreated: 0, programsDeleted: 0, cls: 0, lcp: 0, hiddenChecks: [], errors: [] };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    const before = counters.draws;
    setTimeout(() => counters.hiddenChecks.push({stillHidden:document.hidden,before,after:counters.draws}), 300);
  });
  window.addEventListener('error', e => counters.errors.push(e.message));
  window.addEventListener('unhandledrejection', e => counters.errors.push(String(e.reason)));
  new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) counters.cls += e.value; }).observe({type:'layout-shift', buffered:true});
  new PerformanceObserver(list => { for (const e of list.getEntries()) counters.lcp = e.startTime; }).observe({type:'largest-contentful-paint', buffered:true});
  for (const [method, counter] of Object.entries({drawArrays:'draws',createTexture:'texturesCreated',deleteTexture:'texturesDeleted',createProgram:'programsCreated',deleteProgram:'programsDeleted'})) {
    const original = WebGLRenderingContext.prototype[method];
    WebGLRenderingContext.prototype[method] = function(...args) { counters[counter]++; return original.apply(this, args); };
  }
  if (params.has('no-webgl')) {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.includes('webgl') ? null : getContext.call(this,type,...args); };
  }
  const originalMatchMedia = window.matchMedia.bind(window);
  let reduced = params.has('reduced');
  const listeners = new Set();
  window.matchMedia = query => query === '(prefers-reduced-motion: reduce)' ? {
    get matches() { return reduced; }, media: query,
    addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn),
    addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn),
  } : originalMatchMedia(query);
  window.addEventListener('DOMContentLoaded', () => {
    const panel = document.createElement('details');
    panel.style = 'position:fixed;bottom:0;right:0;z-index:9999;background:white;color:black;font:12px monospace;max-width:90vw;max-height:40vh;overflow:auto';
    panel.innerHTML = '<summary>QA tools</summary><button id="qa-report">Read metrics</button> <button id="qa-reduce">Toggle reduced motion</button> <button id="qa-loss">Lose WebGL context</button><pre id="qa-output"></pre>';
    document.body.append(panel);
    document.querySelector('#qa-report').onclick = () => {
      const canvas = document.querySelector('.nca-canvas');
      const heading = document.querySelector('h1');
      document.querySelector('#qa-output').textContent = JSON.stringify({...counters,
        paints: performance.getEntriesByType('paint').map(e => ({name:e.name,time:Math.round(e.startTime)})),
        resources:performance.getEntriesByType('resource').filter(e=>e.name.endsWith('.js')).map(e=>({name:e.name.split('/').pop(),bytes:e.decodedBodySize})),
        canvas:canvas ? {width:canvas.width,height:canvas.height,touchAction:getComputedStyle(canvas).touchAction}:null,
        posterOpacity: document.querySelector('.nca-poster') && getComputedStyle(document.querySelector('.nca-poster')).opacity,
        headingTop:heading?.getBoundingClientRect().top,
        overflow:document.documentElement.scrollWidth>innerWidth,
      },null,2);
    };
    document.querySelector('#qa-reduce').onclick = () => { reduced = !reduced; for (const fn of listeners) fn({matches:reduced}); };
    document.querySelector('#qa-loss').onclick = () => document.querySelector('.nca-canvas')?.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();
  });
})();
