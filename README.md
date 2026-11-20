# Cogitate

Felix Karg's personal blog and notes site, built with Quartz 5.

## Run locally

Requirements: Node.js 22 or newer and npm.

```sh
npm ci
npx quartz plugin install
npx quartz build --serve
```

Quartz prints the local preview URL when the server starts. To build without starting the server, run `npx quartz build`; the generated site goes into `public/`.

## Content

- `content/posts/` contains full blog posts.
- `content/notes/` contains shorter notes.
- `content/staged/` contains posts that are published while still in progress.
- `drafts/` is private working material and is excluded from the site build.
- `content/home/` contains the About, Now, and other linked pages.

Use Markdown with frontmatter. Quartz supports Obsidian-style wikilinks and callouts, LaTeX, Mermaid, and the Jekyll syntax adapter used by migrated posts. Site settings and plugins live in `quartz.config.yaml`; layout and custom components live in `quartz.ts` and `quartz/`.

`baseUrl` is read from the root `CNAME` file when Quartz starts. Set `QUARTZ_BASE_URL` only to override it locally.

## Publishing

GitHub Actions builds pull requests and deploys the `master` branch to GitHub Pages. The Pages publishing source must be set to **GitHub Actions** in repository settings. The custom domain itself remains configured in Pages settings; `CNAME` supplies Quartz's canonical host and is copied into the build artifact.
