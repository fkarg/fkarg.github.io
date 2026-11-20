---
name: site-maintenance
description: Use when building, previewing, or deploying the Quartz blog; editing Quartz configuration, components, content handling, or GitHub Pages workflow.
---

# Site maintenance

Cogitate is a Quartz 5 site published to one GitHub Pages custom domain. The root `CNAME` file is the source for Quartz `baseUrl`; GitHub Pages domain configuration remains in repository settings.

## Local development

```sh
npm ci
npx quartz plugin install
npx quartz build --serve
```

For a production build without serving locally, run `npx quartz build`. Generated files go to `public/`.

## Content layout

- `content/posts/`: full posts.
- `content/notes/`: short notes.
- `content/staged/`: published work in progress.
- `content/home/`: static pages and redirect data.
- `drafts/`: private, excluded material; never publish it accidentally.

Quartz configuration is in `quartz.config.yaml`; custom layout and the legacy Markdown transformer are in `quartz.ts` and `quartz/`. The GitHub Actions workflow builds pull requests and deploys only `master`. Do not change Pages settings or publish without explicit user direction.
