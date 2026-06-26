# Deployment

The site is configured for GitHub Pages. On every push to `main`, the deploy
workflow installs dependencies with Bun, builds the site into `dist/`, uploads
that directory, and publishes it through GitHub Pages.

## Repository Settings

In the new repository:

1. Enable GitHub Pages.
2. Set the source to GitHub Actions.
3. Confirm the production domain, if one is used, points at GitHub Pages.

The build uses root-relative paths for `emergingresearchers.life`. If the site
is deployed under a subpath instead, update `BASE_PATH` in `src/router.tsx` and
the `publicPath` option in `build.ts`.

## Calendar Files

Event JSON and `.ics` files are generated into `.build/events/` during content
processing and copied into `dist/events/` by `bun run build`. Do not edit these
files by hand.

## Local Production Check

```bash
bun run build
NODE_ENV=production bun src/index.ts
```

Then open the local server URL printed by Bun and check the main navigation,
event pages, article pages, and `/events/era-events.ics`.
