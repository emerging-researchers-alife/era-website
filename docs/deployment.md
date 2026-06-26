# Deployment

The site is configured for Cloudflare Pages. On every push to `main`, the deploy
workflow installs dependencies with Bun, runs tests, builds the site into
`dist/`, and uploads that directory to Cloudflare Pages with Wrangler.

## Cloudflare Project

Production deployment currently targets the existing Cloudflare Pages project:

- Project name: `emergingresearchers`
- Default Pages URL: `https://emergingresearchers.pages.dev/`
- Build command: `bun run build`
- Build output directory: `dist`
- Production branch: `main`

The build uses root-relative paths for a root domain such as
`emergingresearchers.life`. If the site is deployed under a subpath instead,
update `BASE_PATH` in `src/router.tsx` and the `publicPath` option in
`build.ts`.

## GitHub Repository Settings

The deployment workflow uses Cloudflare Pages Direct Upload through GitHub
Actions. Add these repository secrets before relying on automatic deployment:

1. `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID that owns the
   `emergingresearchers` Pages project.
2. `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with Pages edit/deploy access
   for that account.

If either secret is missing, the workflow still validates and builds the site,
but skips deployment with a warning.

If ERA prefers Cloudflare's native Git integration instead, connect the GitHub
repository in the Cloudflare dashboard with the same build settings above and
remove `.github/workflows/deploy.yml`.

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
