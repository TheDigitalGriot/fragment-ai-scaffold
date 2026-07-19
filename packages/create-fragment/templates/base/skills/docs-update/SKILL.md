---
name: docs-update
description: Sync {{PROJECT_NAME}}'s documentation site from a versioned monolithic doc file (docs/DOCUMENTATION-[version].md). Use when the docs source changes and the site pages must be updated.
model: sonnet
---

# {{PROJECT_NAME}} Docs Update

Sync a documentation site from a monolithic source doc. Generalized from the Prism docs-update workflow.

## Step 0: Find the source

```bash
ls -t docs/DOCUMENTATION-*.md 2>/dev/null | head -1
```

## Step 1: Analyze

Grep the source doc's headings (`^## |^### `); compare each section against the current site pages; identify new / changed / removed content.

## Step 2: Report + approve

Present a change summary (new sections, updated sections, pages to touch). **Wait for approval before writing.**

## Step 3: Apply

- `Edit` for targeted changes; `Write` only for new pages or >80% rewrites.
- Preserve frontmatter; add new pages to the site nav/config.

## Rules

1. Always summarize + get approval before writing.
2. Preserve frontmatter; never reformat or rewrap ASCII-art code blocks.
3. Track progress with a todo list for updates spanning 5+ pages.
