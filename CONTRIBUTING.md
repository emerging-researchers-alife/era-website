# Contributing to the ERA site

ERA content is file-based. Articles and events are Markdown files in the repo;
generated registries, JSON files, calendar feeds, and `dist/` are built
automatically and should not be committed.

## Quick start

```bash
bun install
bun run dev
```

The development server runs at `http://localhost:3001`.

## Add an event

1. Copy the template: `cp src/content/events/_template.md src/content/events/your-event-slug.md`
2. Fill in the frontmatter — wall-clock `start` time + an IANA `timezone`, and an
   optional RRULE `recurrence`. Full guide: `src/content/articles/how-to-submit-events.md`
   (rendered at `/resources/how-to-submit-events`).
3. Validate and preview: `bun run scripts/process-events.ts --check` and `bun run dev`.
4. Commit **only** your `.md`, push, and open a PR against `main`.

## Add an article

1. Create `src/content/articles/your-article-slug.md` (see `_template.md`).
2. Full guide: `src/content/articles/how-to-submit-articles.md` (`/resources/how-to-submit-articles`);
   formatting reference: `how-to-format-articles.md`.
3. Commit **only** your `.md` (plus any images under `public/articles/<slug>/`),
   push, and open a PR.

## What to commit

| Commit | Do not commit |
| --- | --- |
| `src/content/events/*.md` | `src/content/events.registry.ts` |
| `src/content/articles/*.md` | `src/content/registry.ts` |
| `public/articles/<slug>/*` (images) | `dist/`, `.build/` (JSON + `.ics`) |

The generated files are recreated by `bun install`, `bun run content`,
`bun run dev`, and the deploy workflow.

## Before opening a pull request

```bash
bun run content
bun test
bun run build
```

## What happens after you open a PR

1. Automated validation checks content and build health.
2. A maintainer reviews the change.
3. Merging to `main` rebuilds and deploys the site through GitHub Pages.
