# Repository guidance

## What this repository contains

Cogitate is Felix Karg's personal blog and notes site, built with Quartz 5 and hosted as a single GitHub Pages site at the custom domain in `CNAME`.

## Writing feedback

The main writing use case is feedback on drafts, not writing them. For requests to review or critique a post or story, use `.claude/skills/writing-feedback/`. Do not rewrite prose unless explicitly asked.

## Content and publishing

- Published content lives under `content/` (`posts/`, `notes/`, `staged/`, and `home/`).
- `drafts/` is private working material and must stay excluded from generated output.
- Quartz config is in `quartz.config.yaml` and `quartz.ts`.
- `baseUrl` comes from the root `CNAME` file.
- GitHub Actions builds on pull requests and deploys `master` to GitHub Pages. Do not deploy, change Pages settings, or commit unless asked.

For local setup and preview commands, follow `README.md`.

## Conventions

- Periodically make commits. Never add co-author or AI attribution trailers.
