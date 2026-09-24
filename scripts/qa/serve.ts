// Local-only review server. Never included in the production build.
import exporter from './export-lizard.html';
import lifecycle from './lifecycle.html';
const root = process.env.ERA_PREVIEW_ROOT || process.cwd() + '/dist';
Bun.serve({ hostname: '127.0.0.1', port: 4317, routes: {
  '/export-lizard': exporter,
  '/lifecycle': lifecycle,
  '/save-poster': { POST: async req => {
    if (req.headers.get('origin') !== new URL(req.url).origin) return new Response('Forbidden', {status:403});
    const bytes = await req.arrayBuffer();
    const signature = new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 8));
    if (signature.join(',') !== '137,80,78,71,13,10,26,10') return new Response('PNG required', {status:400});
    if (bytes.byteLength > 100_000) return new Response('Too large', { status: 413 });
    await Bun.write('src/assets/nca/lizard-poster.png', bytes);
    return new Response('Saved');
  } },
}, async fetch(req) {
  const url = new URL(req.url);
  const path = decodeURIComponent(url.pathname);
  if (path === '/qa-instrument.js') return new Response(Bun.file('scripts/qa/instrument.js'));
  const actualRoot = url.searchParams.has('baseline') || req.headers.get('referer')?.includes('baseline') ? '/private/tmp/era-baseline' : root;
  if (path.endsWith('.js') && req.headers.get('cookie')?.includes('era_qa_mode=slow')) await Bun.sleep(1000);
  if (path === '/') {
    let html = await Bun.file(actualRoot + '/index.html').text();
    if (url.searchParams.has('no-js')) html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
    else if (['qa', 'baseline', 'reduced', 'no-webgl', 'slow', 'fail-simulation'].some(mode => url.searchParams.has(mode))) html = html.replace('<head>', '<head><script src="/qa-instrument.js"></script>');
    const scenario = ['slow', 'fail-simulation'].find(mode => url.searchParams.has(mode)) || 'normal';
    return new Response(html, {headers:{'Content-Type':'text/html', 'Set-Cookie':`era_qa_mode=${scenario}; Path=/; SameSite=Strict`}});
  }
  if (path.includes('..')) return new Response('Not found', {status:404});
  const file = Bun.file(actualRoot + (path === '/' ? '/index.html' : path));
  if (await file.exists()) {
    if (path.endsWith('.js') && req.headers.get('cookie')?.includes('era_qa_mode=fail-simulation') && (await file.text()).includes('revealAfterSteps:100')) {
      return new Response('Simulated module failure', {status:503});
    }
    return new Response(file);
  }
  if (!path.split('/').pop()!.includes('.')) {
    const routeShell = Bun.file(actualRoot + path.replace(/\/$/, '') + '/index.html');
    return new Response(await routeShell.exists() ? routeShell : Bun.file(actualRoot + '/404.html'));
  }
  return new Response('Not found', {status:404});
}});
console.log('Review server: http://127.0.0.1:4317');
