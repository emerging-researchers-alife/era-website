# Architecture

The ERA site is a Bun-powered React app with file-based content.

## Runtime

- `src/index.ts` starts the Bun server.
- `src/frontend.tsx` mounts the React app.
- `src/router.tsx` defines TanStack Router routes.
- `src/routes/` contains the public pages.

The server serves generated article JSON from `.build/articles/` in development
or `dist/articles/` in production. Event JSON and `.ics` files are served the
same way from the matching `events` directory.

## Content Processing

- `scripts/process-articles.ts` converts article Markdown into metadata and
  per-article JSON.
- `scripts/process-events.ts` validates event Markdown, expands recurrence
  rules, and writes event JSON plus calendar feeds.
- `scripts/lib/` contains shared validators, Markdown transforms, and event
  recurrence utilities.

Generated registries are written to `src/content/registry.ts` and
`src/content/events.registry.ts` so React can import metadata at build time.
Both files are gitignored.

## Build Output

`bun run build` runs content processing and then `build.ts`. The build script
bundles the frontend into `dist/`, writes static-hosting fallbacks for
client-side routes, and copies generated article/event assets into the final
output.
