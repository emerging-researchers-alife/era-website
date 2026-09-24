# Article reliability review — 2026-09-24

Local changes; not committed or deployed.

## Reader experience

- Table-of-contents navigation measures after mobile menu collapse, without a
  timer or animated height change. Navigation uses an immediate scroll with a
  100 px header offset and updates the fragment. Section tracking compares
  viewport-relative heading geometry, rather than mixing offset-parent and
  document coordinates. The sidebar is excluded from browser scroll anchoring.
- Existing fixes preserve position when switching framework tabs, wrap code,
  and render semantic figures with real images and captions.
- Article image assets and downloadable examples are served in development and
  copied into production. Asset links bypass the SPA route interceptor.
- Removed redundant full-image clip paths from the original NCA SVG. Safari
  omitted its embedded PNGs with those clips; the repaired image renders them.

## Content

- Corrected draft-preview commands and explained Markdown regeneration.
- Added missing event branch creation, publication status, and accurate build timing.
- Replaced the missing thumbnail with the credited lizard render, also provided
  as a training target.
- Repaired PyTorch channel/filter grouping, MLX weight layout and seed assignment,
  JAX convolution layout and differentiable fixed-length scan, and pre/post alive masks.
- Added downloadable scripts, Python 3.12 setup, direct dependency pins, one-step
  smoke instructions, saved weight files, and explicit basic-growth vs regeneration scope.

## Verification

- TypeScript, 16 Bun tests, article/event processing, production build, build QA,
  and all published article internal links/images passed locally.
- Python 3.12.13: PyTorch 2.14.0 (CPU), JAX 0.11.2 with Flax 0.12.9 and Optax 0.2.8
  (CPU), MLX 0.32.2 (Metal) each passed both displayed snippets and full-script checks.
  Checks cover channel identity/gradient-filter outputs, tensor shape, one real
  optimizer update, finite changed parameters, and short visualization output.
  These are execution checks, not completed training or demonstrated regeneration.
- Chrome desktop: training heading landed at 99.83 px; return from expanded full
  script to Core Idea settled at 99.87 px. At 390×844, mobile menu collapsed and
  target landed at 100.12 px. No code or page horizontal overflow; tab switch
  retained the selected block within 1 px; clipboard contained the selected code.
- Safari desktop: article loaded, table-of-contents navigation reached Core Idea,
  diagram/caption rendered including embedded lizard images after SVG repair.
  This is a Safari smoke check, not physical iPhone/iPad coverage.

## Repeatable checks

CI now runs the pinned TypeScript checker, checks article-script parity, and
checks built article assets/internal links. Python execution checks are manual
because they require separately installed framework dependencies (MLX needs Metal):

```sh
python3 scripts/qa/export-nca-examples.py --check
python3 scripts/qa/check-nca-examples.py pytorch
python3 scripts/qa/check-nca-examples.py jax
python3 scripts/qa/check-nca-examples.py mlx
bun scripts/qa/check-build.ts
bun scripts/qa/check-article-links.ts
```

Do not equate desktop viewport emulation with physical mobile-device acceptance.
