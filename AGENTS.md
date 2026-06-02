# AGENTS.md

Guidance for AI agents (Claude Code, etc.) working in this repository.

## Giving writing feedback (the main use case)

The biggest help here is **feedback on drafts, not writing them**. When asked to
review/critique a post or story, or "how will this land?", use the
`writing-feedback` skill (`.claude/skills/writing-feedback/`). It explains the
craft rules and their *why*, respects intentional rule-bending, and can simulate
reader reactions — and it **never edits or rewrites the author's prose** unless
explicitly asked. Do not offer rewrites by default.

## What this repo is

Personal blog "Cogitate" by Felix Karg, built on Beautiful Jekyll v6.0.1. It is
content + theme; it does not own its own runtime.

It is served from **two independent origins that must each work standalone** — if
one is down, the other keeps serving:

- `www.fkarg.me` — CNAME → GitHub Pages, built from `master`.
- `blog.fkarg.de` — self-hosted via `../site-setup/docker-compose.yml`.

This is the one load-bearing invariant: don't hard-code one origin's host in the
other's output (internal/canonical/feed URLs use `relative_url`). Any edit that
touches build, deploy, the theme, `_config.yml`, content layout, or search should
load the **`site-maintenance` skill** (`.claude/skills/site-maintenance/`), which
holds the build commands, theme structure, publishing flow, and customization
inventory.

## Conventions

- Periodically make commits. NEVER add extra co-author information — it is pure
  noise.
