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

Personal blog "Cogitate" by Felix Karg, served from two independent origins:

- `www.fkarg.me` (CNAME → GitHub Pages, built from `master`)
- `blog.fkarg.de` (self-hosted via `../site-setup/docker-compose.yml`,
  Jekyll runs in the `jekyll/jekyll` container against this repo as a
  bind mount)

Each origin must work standalone — if one is unavailable, the other keeps
serving. This is why most internal/canonical/feed URLs in the theme use
`relative_url`; see §1 of `docs/theme-customizations.md`.

Built on Beautiful Jekyll **v6.0.1** with a small set of local
customizations on top. The upstream layout/includes/CSS belong to the
theme; site-specific content lives in `_config.yml`, `_posts/`, `home/`,
`staged/`, and `drafts/`.

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

## Theme structure (Beautiful Jekyll v6.0.1)

When editing chrome (header, footer, post layout, etc.) the relevant files are upstream theme files — change them in-place rather than creating new ones.

- `_layouts/base.html` — root template; declares the `common-css`/`common-js`/`common-ext-css`/`common-ext-js` lists in its own front-matter. Extended by `default.html`, `post.html`, `page.html`, `home.html`, `minimal.html`.
- `_includes/` — `head.html`, `nav.html`, `header.html`, `footer.html`, plus per-integration partials (`disqus.html`, `gtag.html`, `gtm_*.html`, …). Most are gated by `_config.yml` flags being uncommented. Comments and tracking are currently OFF — comment widgets and Matomo all gated to no-ops, but the `disqus.html` / `fb-comment.html` shells remain (calling unset config) in case a future backend lands. The planned future backend is Remark42 in `../site-setup` — see TODO in that repo's README.
- `_includes/mathjax.html` — local include, called from `head.html`. Loads MathJax v3 distribution from `assets/js/mathjax/` only on pages with `tex: true` front-matter.
- `_includes/search.html` — modified upstream. Loads `assets/js/lunr.js` and `assets/js/site-search.js` instead of upstream's CDN `simple-jekyll-search`.
- `_data/ui-text.yml` — i18n strings used by the theme.

Navbar entries, social links, comment provider, and analytics are all wired through `_config.yml` — prefer toggling config over editing includes.

## Search

The navbar search overlay is enabled by `post_search: true` in `_config.yml`. The implementation is local (not upstream's `simple-jekyll-search`):

- `assets/data/searchcorpus.json` — built at site-build time. Excludes future-dated posts. Per-post fields: `id`, `title`, `subtitle`, `url`, `date`, `tags`, `thumbnail`, `excerpt`, `content`.
- `assets/js/lunr.js` — vendored Lunr 2.3.9.
- `assets/js/site-search.js` — fetches the corpus on first overlay open (or on `requestIdleCallback`), builds a Lunr index with field boosts (`url`/`title` ×10, `tags`/`subtitle` ×5, `excerpt` ×3, `content` default), supports prefix matching (`*`) and fuzzy edit-distance-1 (`~1`). Single-word queries run both `~1` and `*~1` and pick the better result set.
- `_includes/search.html` — the overlay markup (mostly upstream, swaps the script tags).
- `404.html` — has a "Search this site" button that opens the overlay with the broken slug pre-filled.

## Local customizations on top of v6.0.1

See `docs/theme-customizations.md` for the full inventory. Briefly:

- Relative URLs throughout (canonical, og:url, RSS, feed item links) so both origins work standalone.
- `assets/js/redirect.js` + `home/forwards.json` map renamed slugs (404 lookup chain).
- `_includes/header.html`: "Draft" label when `page.date` is absent (for `staged/` pages).
- `_includes/readtime.html`: word count instead of estimated minutes.
- `_layouts/home.html` + `tags.html`: hide future-dated posts.
- CSS tweaks in `assets/css/beautifuljekyll.css` (justified paragraphs, blockquote restyle, post-preview grayscale-on-hover, `.hidden`, search-result card styles).

## Conventions worth knowing

- Posts use kramdown + GFM with MathJax (`kramdown.math_engine: mathjax`). Set `tex: true` in a post's front-matter to load MathJax for that page.
- Pagination is 5 posts/page via `jekyll-paginate`.
- `home/forwards.json` and the various `home/*.md` pages are linked from the navbar; their paths are referenced verbatim in `_config.yml`'s `navbar-links`, so renaming a file means updating the config too.
- After changing Gemfile deps, regenerate the lockfile against multi-platform with the docker one-liner above (so it works on both arm64-darwin and linux).
- Periodically make commits. NEVER add extra co-author information - it is pure noise.
