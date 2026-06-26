# ERA - Emerging Researchers in Artificial Life

The website for ERA, the student chapter of the International Society for
Artificial Life. It is a Bun, React, and TanStack Router site with articles and
events authored as Markdown files in the repository.

## Requirements

- [Bun](https://bun.sh/)

## Quick Start

```bash
bun install
bun run dev
```

The development server runs at `http://localhost:3001` by default.

## Build And Test

```bash
bun run content
bun test
bun run build
```

`bun run build` writes the production site to `dist/`.

## Project Structure

```text
src/routes/              Public page routes
src/components/          React components
src/content/articles/    Article Markdown
src/content/events/      Event Markdown
scripts/                 Content processing and validation
docs/                    Maintainer documentation
```

Generated registries, JSON files, `.ics` feeds, and `dist/` are not committed.
They are recreated by `bun install`, `bun run content`, and `bun run build`.

## Content And Deployment

- Articles render at `/resources/<slug>`.
- Events render on `/events` and event detail pages.
- Calendar feeds are generated from event Markdown.
- GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/content.md](./docs/content.md).
