# Content Guide

ERA content is stored as Markdown in `src/content/`. Generated registries,
per-page JSON, and calendar files are built automatically and should not be
committed.

## Articles

Article files live in `src/content/articles/` and render at
`/resources/<slug>`, where `<slug>` is the filename without `.md`.

Start from `src/content/articles/_template.md`. Required frontmatter:

```yaml
title: "Article title"
date: "2026-01-15"
authors:
  - name: "Author Name"
tags:
  - "tutorial"
abstract: >
  A short summary for article listings.
status: "draft"
```

Use `status: "draft"` while writing and `status: "published"` when ready. The
site supports standard Markdown, GitHub-flavored Markdown, math, sidenotes,
code tabs, expandable code blocks, and NCA demos.

## Events

Event files live in `src/content/events/` and render on `/events` plus an event
detail page. Start from `src/content/events/_template.md`.

Event times are authored as wall-clock local times plus an IANA timezone:

```yaml
start: "2026-07-09T09:00"
timezone: "America/New_York"
durationMinutes: 60
```

Recurring events use RFC 5545 RRULE strings:

```yaml
recurrence: "FREQ=MONTHLY;BYDAY=TH;BYSETPOS=2"
```

Use `exdates` for cancelled instances and `rdates` for one-off additions.

## Validation

Run these before opening a pull request:

```bash
bun run content
bun test
bun run build
```
