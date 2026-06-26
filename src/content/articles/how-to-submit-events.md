---
title: "How to Submit Events"
subtitle: "A guide to adding events to the ERA calendar"
date: "2026-01-01"
authors:
  - name: "ERA"
tags:
  - "meta"
  - "documentation"
  - "guide"
abstract: >
  Learn how to add events to the ERA calendar using wall-clock times, IANA
  timezones, and RFC 5545 recurrence rules.
status: "published"
featured: false
---

ERA events live in `src/content/events/` as Markdown files with YAML
frontmatter. The frontmatter drives the `/events` page and the generated `.ics`
calendar feeds.

## Create the Event File

Copy `src/content/events/_template.md` to a new filename:

```bash
cp src/content/events/_template.md src/content/events/your-event-slug.md
```

Use a short lowercase slug with hyphens. Keep template files underscore-prefixed
so the build skips them.

## Choose Time and Timezone

Use local wall-clock time for `start`, `end`, `exdates`, and `rdates`:

```yaml
start: "2026-01-08T18:00"
timezone: "Europe/Oslo"
durationMinutes: 60
```

Do not include an offset or `Z`. Pick an IANA timezone such as
`Europe/Oslo`, `America/New_York`, `Asia/Tokyo`, or `UTC`.

## Add Recurrence

ERA uses RRULE, the RFC 5545 recurrence format used by calendar apps.

Common examples:

```yaml
recurrence: "FREQ=MONTHLY;BYDAY=2TH" # second Thursday each month
recurrence: "FREQ=WEEKLY;BYDAY=MO"   # every Monday
recurrence: "FREQ=YEARLY"            # annually
```

Use `exdates` to remove specific local occurrences and `rdates` to add extra
local occurrences:

```yaml
exdates:
  - "2026-04-09T18:00"
rdates:
  - "2026-04-16T18:00"
```

## Preview and Validate (optional)

You only ever commit your event Markdown file. The event registry and `.ics`
calendar files are **generated automatically** — they are gitignored and rebuilt
on every install, on each pull request, and on deploy, so there is nothing else
to add to git.

To check and preview your event before opening a PR:

```bash
bun run scripts/process-events.ts --check   # validate frontmatter, timezone, RRULE, URLs
bun run dev                                  # preview at http://localhost:3001/events
```

The same validation runs automatically on your pull request.

## Open a Pull Request

Commit only your new file:

```bash
git add src/content/events/your-event-slug.md
git commit -m "Add event: Your Event Name"
git push -u origin event/your-event-slug
```

Open a pull request against `main`. Automated validation runs on the PR; once a
maintainer merges it, the site rebuilds and publishes your event — no manual
registry or calendar edits required.
