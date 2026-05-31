# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Personal blog "Cogitate" by Felix Karg, served at `www.fkarg.me` (CNAME) via GitHub Pages from `master`. Built on a fork of the Beautiful Jekyll theme — most of the layout/includes/CSS belongs to that upstream theme, while the site-specific content lives in `_config.yml`, `_posts/`, `home/`, `staged/`, and `drafts/`.

## Local development and deployment

This repo is just content + theme — it does not own its own runtime. There are three places it gets built:

- **GitHub Pages** (CNAME → `www.fkarg.me`): builds from `master`.
- **Self-hosted at `blog.fkarg.de`**: the `blog` service in `../site-setup/docker-compose.yml` bind-mounts this repo into the `jekyll/jekyll` Docker image and runs `jekyll serve --watch --incremental`. The image's entrypoint runs `bundle install` against this repo's `Gemfile`/`Gemfile.lock` on startup. **Don't add a `docker-compose.yml` here** — orchestration lives in `../site-setup`.
- **CI** (`.github/workflows/ci.yml`): a daily `jekyll build --future` smoke check inside `jekyll/builder:3.8`. This image ignores the Gemfile entirely (uses its baked-in jekyll), so CI passing doesn't prove the lockfile resolves.

For a local one-off build/preview against the same image production uses:

```sh
docker run --rm -it -v "$(pwd):/srv/jekyll" -p 4000:4000 jekyll/jekyll \
  sh -c "bundle install && bundle exec jekyll serve --host 0.0.0.0 --watch --incremental --force_polling"
```

`--force_polling` is required on macOS because bind-mount inotify events don't reach the container, so the file watcher won't otherwise see edits.

The `Gemfile` declares `gem 'github-pages'` so the local/self-hosted runtime matches what GitHub Pages produces. The Ruby gemspec (`beautiful-jekyll-theme.gemspec`) is upstream theme packaging — leave its `jekyll ~> 3.8` pin alone; github-pages itself is the source of truth for jekyll version. After changing Gemfile deps, regenerate the lockfile with a multi-platform resolution so it works on both arm64-darwin (local) and linux (server/CI):

```sh
docker run --rm -v "$(pwd):/work" -w /work ruby:3.3-slim sh -c \
  "apt-get update -qq && apt-get install -y --no-install-recommends git -qq && \
   git config --global --add safe.directory /work && \
   bundle lock --add-platform arm64-darwin x86_64-linux aarch64-linux"
```

The `shell.nix` / `default.nix` / `Gemfile-nix-shell` / `gemset.nix` files are vestigial — they were an older nix-based dev flow and are no longer used.

## Content layout — what gets published

`_config.yml` controls a few non-default behaviours that matter when adding or moving content:

- **Permalink**: `/:year-:month-:day-:title/` (note the dashes, not slashes — links elsewhere on the site assume this exact shape).
- **`excerpt_separator: "* TOC"`** — index-page excerpts are cut at the literal string `* TOC`. Posts that want a controlled excerpt should include a `* TOC` line; otherwise the first ~50 words are used.
- **Default front-matter** applied via `defaults:` — `_posts/*` get `layout: post`, `comments: true`, `social-share: true`, `readtime: true`, `tex: false` (turn TeX on per-post when needed). Everything under `staged/` is treated as a post (`layout: post`, `published: true`). Everything else defaults to `layout: page`.
- **Excluded from the production build**: `drafts/`, `docs/`, `staged/*.py`, `staged/*.txt`, plus the nix-shell files, README, CHANGELOG, etc. This means:
  - `drafts/` is a private scratch area — files there will not appear on the live site even though Jekyll sees the directory.
  - `staged/` IS published (it's a real collection of posts-in-progress), except for the `.py`/`.txt` helpers that live alongside the markdown.
  - To "promote" a draft, move it from `drafts/` → `_posts/` (and rename to `YYYY-MM-DD-title.md`) or → `staged/` for a softer publish.

## Theme structure (Beautiful Jekyll)

When editing chrome (header, footer, post layout, etc.) the relevant files are upstream theme files — change them in-place rather than creating new ones:

- `_layouts/base.html` — root template; declares the `common-css`/`common-js` lists in its own front-matter and is extended by `default.html`, `post.html`, `page.html`, `home.html`, `minimal.html`, `search.html`.
- `_includes/` — `head.html`, `nav.html`, `header.html`, `footer.html`, plus per-integration partials (`disqus.html`, `gtag.html`, `gtm_*.html`, …). Most are gated by `_config.yml` flags being uncommented. Comments and Matomo are currently off — the Matomo / Staticman / Utterances includes (and the `_data/comments/` historical data) were all removed. `_includes/comments.html` still exists and still wires Disqus / Facebook gated on their config flags (also unset), but there's no working backend until Remark42 lands in `../site-setup` — see TODO in that repo.
- `_data/ui-text.yml` — i18n strings used by the theme.

Navbar entries, social links, comment provider, and analytics are all wired through `_config.yml` — prefer toggling config over editing includes.

## Conventions worth knowing

- Posts use kramdown + GFM with MathJax (`kramdown.math_engine: mathjax`). Set `tex: true` in a post's front-matter to load MathJax for that page.
- Pagination is 5 posts/page via `jekyll-paginate`; the homepage uses `_layouts/home.html`.
- `home/forwards.json` and the various `home/*.md` pages are linked from the navbar; their paths are referenced verbatim in `_config.yml`'s `navbar-links`, so renaming a file means updating the config too.
- Periodically make commits. NEVER add extra co-author information - it is pure noise.
