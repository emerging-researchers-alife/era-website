# Landing page refinement review

Reviewed 24 September 2026 against baseline commit `be8578b`. Local implementation and browser acceptance; not deployed.

## Changes

- Homepage content is rendered into the production HTML at build time. Its eager client route replaces that markup without an empty route-loading stage. This is an initial HTML render, not a full SSR/hydration migration. Other routes retain their own app shells.
- Headline and actions no longer wait for entrance animation. Existing colors, fonts, wording, navigation and analytics event names are preserved. Hero links no longer contain nested buttons.
- A 4,410-byte transparent PNG from the actual lizard model stays visible while the simulation loads, or when motion is reduced or WebGL fails. A short crossfade reveals the live organism after 100 steps. The illustration and controls reserve stable layout space.
- NCA code and weights load separately after the initial page paint. The simulation domain remains 96 × 96 across screen sizes; CSS changes presentation size without resetting it.
- The canvas has one lifecycle for initialization, drawing, pausing, resize and cleanup. It cancels requests on unmount, deletes textures/framebuffers/programs/buffers, and reports initialization or context failure to its host.
- Simulation pacing is fixed at 60 ticks/second with bounded catch-up. Hidden/offscreen canvases and explicitly paused animations stop scheduling frames.
- Touch handling permits vertical scrolling and pinch zoom. Short taps disturb the model; swipes do not paint. Desktop drag and double-click reset remain available.
- Keyboard-accessible pause/resume controls are available on the homepage and article demos. Article demos also respect reduced motion and use the poster on failure.
- Phone layouts have a smaller illustration, balanced heading wrapping and equal-width stacked actions. The bouncing scroll indicator is removed.
- Real production code splitting is enabled. KaTeX CSS/fonts are served separately for article routes instead of embedding their font data into the landing page CSS.

## Evidence

### Automated checks

- `bun test`: 13 passing tests, including pacing across 30/60/120/144 Hz, bounded catch-up and resume behavior.
- Production content generation and `bun build.ts`: pass.
- `bun scripts/qa/check-build.ts`: pass. Checks initial homepage content, anchors, poster, route-shell isolation, absence of QA/build-machine paths, CSS size and every referenced math font file.
- Browser lifecycle fixture: nine checks pass in Chrome: mount/ready, callback stability, resize restart, resize texture cleanup, pause, resume, context loss, unmount cleanup, failed weights request.
- Full TypeScript check is not clean at baseline: 81 diagnostics before, 74 after. No new diagnostic categories; existing errors remain in unrelated components/build tooling and older parts of the NCA engine.

### Browser review

Chrome desktop and responsive viewports: 1440 × 900, 768 × 1024, 390 × 844, 320 × 568 and 844 × 390 landscape. The compact phone layout shows both primary actions in the initial viewport. Desktop-to-phone changes keep the animation alive.

Verified in the browser:

- readable homepage with scripts removed;
- readable poster/content while scripts are delayed;
- reduced-motion initial state allocates no WebGL textures and draws no frames;
- changing the reduced-motion preference stops/releases the simulation and switching back restarts it;
- unavailable WebGL and failed dynamic-module download retain the poster without an uncaught page error;
- forced context loss removes the canvas, restores the poster and deletes all eight textures;
- pause leaves GPU draw count unchanged; resume advances it;
- offscreen draw count stays unchanged (5,903 → 5,903), then increases after returning (5,973);
- keyboard Space toggles pause/resume with a visible focus indicator;
- mobile navigation opens/closes, resource navigation and article routes load;
- article NCA pause works, and the article display equation renders correctly with separately served math fonts.

Desktop Safari spot check: homepage content and live lizard render; pause changes to resume. The automated Safari lifecycle fixture remained in a hidden document (visibility=hidden, two seed draws, no ready callback), so its readiness check did not pass and is not counted as lifecycle acceptance. The fixture now waits for observable readiness for up to ten seconds rather than assuming a 700 ms startup. Physical touch behavior is not established by desktop viewport testing.

### Local loading measurements

One same-session Chrome desktop comparison at 1440 × 900, using the production builds and a local observer harness:

| Measure | Before | After |
| --- | ---: | ---: |
| FCP | 88 ms | 36 ms |
| LCP | 1,552 ms | 112 ms |
| CLS | 0.436 | 0.0025 |
| Total emitted CSS, uncompressed | 1,524,733 bytes | 81,010 bytes |

These are local regression observations, not field metrics, mobile throttling results, or a Lighthouse score. Browser caches and local delivery make timing unrepresentative of public-network performance. CSS bytes are directly measured build outputs; there are now two CSS assets. Approximately 441 KB of application JavaScript loads before the deferred NCA, compared with the previous 668 KB single application bundle. The deferred NCA adds approximately 82 KB.

## Reproduce

```sh
bun scripts/process-articles.ts
bun scripts/process-events.ts
bun build.ts
bun test
bun scripts/qa/check-build.ts
bun scripts/qa/serve.ts
```

The review server binds only to `127.0.0.1:4317`. `/` is the clean production preview. `/?qa` adds local counters and failure controls. Additional cases are `/?reduced`, `/?no-webgl`, `/?no-js`, `/?slow`, and `/?fail-simulation`. Slow mode adds one second of latency per JavaScript request; it does not emulate a cellular bandwidth or CPU profile. `/lifecycle` runs the nine browser regression checks. QA code is outside the production entrypoints.

`/export-lizard` grows the same bundled model for 320 steps and lets a reviewer save a new poster. It is a local development tool, not a production route. The poster is derived from the Growing Neural Cellular Automata Experiment 3 model by Mordvintsev, Randazzo, Niklasson and Levin (2020), as attributed in the existing NCA tutorial (CC BY 4.0).

## Remaining acceptance

- Physical iOS Safari and Android Chrome: scroll gestures beginning on the artwork, pinch zoom, rotation, background/resume, low-power behavior and sustained thermal cost.
- Firefox, enlarged-text/zoom review, and controlled public-network/CPU performance measurements.
- The document-visibility pause branch is implemented; a controlled foreground/background acceptance run remains separate from the verified offscreen and explicit-pause checks.
- Existing article issues observed during the broader review: the mobile table-of-contents jump can land above its intended section after collapsing, and one NCA article figure exposes its caption directive as text. These predate this landing-page work and were not changed.

No deployment or physical-device acceptance is implied by this review.
