---
name: site-maintenance
description: Use when building, previewing, serving, or deploying this Jekyll blog; editing the Beautiful Jekyll theme (layouts, includes, CSS); changing _config.yml, permalinks, navbar, the drafts/staged publishing flow, the search overlay, or the Gemfile/Gemfile.lock. Covers the two-origin (GitHub Pages + self-hosted) setup and its constraints.
---

# Site maintenance (build, deploy, theme, content)

Operational and structural detail for the "Cogitate" blog. `AGENTS.md` holds the
identity and the one hard invariant; this skill holds the how-to you load only
when actually doing build/deploy/theme/config work.

## The two origins (and why it constrains edits)

Served from two independent origins that must each work standalone — if one is
down, the other keeps serving:

- `www.fkarg.me` — CNAME → GitHub Pages, built from `master`.
- `blog.fkarg.de` — self-hosted via `../site-setup/docker-compose.yml`; Jekyll
  runs in the `jekyll/jekyll` container against this repo as a bind mount.

**Consequence:** most internal/canonical/feed URLs use `relative_url` so neither
origin hard-codes the other's host. Preserve this in any theme/URL edit. See §1 of
`docs/theme-customizations.md`.

Built on Beautiful Jekyll **v6.0.1** with a small set of local customizations.
Upstream layout/includes/CSS belong to the theme; site-specific content lives in
`_config.yml`, `_posts/`, `home/`, `staged/`, and `drafts/`.

## Local development and deployment

This repo is content + theme; it does not own its runtime. Three build sites:

- **GitHub Pages** (CNAME → `www.fkarg.me`): builds from `master`.
- **Self-hosted at `blog.fkarg.de`**: the `blog` service in
  `../site-setup/docker-compose.yml` bind-mounts this repo into the
  `jekyll/jekyll` image and runs `jekyll serve --watch --incremental`. The image's
  entrypoint runs `bundle install` against this repo's `Gemfile`/`Gemfile.lock` on
  startup. **Don't add a `docker-compose.yml` here** — orchestration lives in
  `../site-setup`.
- **CI** (`.github/workflows/ci.yml`): a daily `jekyll build --future` smoke check
  inside `jekyll/builder:3.8`. This image ignores the Gemfile (uses its baked-in
  jekyll), so CI passing doesn't prove the lockfile resolves.

Local one-off build/preview against the same image production uses:

```sh
docker run --rm -it -v "$(pwd):/srv/jekyll" -p 4000:4000 jekyll/jekyll \
  sh -c "bundle install && bundle exec jekyll serve --host 0.0.0.0 --watch --incremental --force_polling"
```

`--force_polling` is required on macOS because bind-mount inotify events don't
reach the container, so the watcher won't otherwise see edits.

The `Gemfile` declares `gem 'github-pages'` so the local/self-hosted runtime
matches GitHub Pages. The gemspec (`beautiful-jekyll-theme.gemspec`) is upstream
theme packaging — leave its `jekyll ~> 3.8` pin alone; github-pages is the source
of truth for the jekyll version. After changing Gemfile deps, regenerate the
lockfile multi-platform so it works on arm64-darwin (local) and linux (server/CI):

```sh
docker run --rm -v "$(pwd):/work" -w /work ruby:3.3-slim sh -c \
  "apt-get update -qq && apt-get install -y --no-install-recommends git -qq && \
   git config --global --add safe.directory /work && \
   bundle lock --add-platform arm64-darwin x86_64-linux aarch64-linux"
```

The `shell.nix` / `default.nix` / `Gemfile-nix-shell` / `gemset.nix` files are
vestigial (older nix-based dev flow, no longer used).

## Content layout — what gets published

`_config.yml` controls a few non-default behaviours that matter when adding/moving
content:

- **Permalink**: `/:year-:month-:day-:title/` (dashes, not slashes — links across
  the site assume this exact shape).
- **`excerpt_separator: "* TOC"`** — index-page excerpts are cut at the literal
  string `* TOC`. Posts wanting a controlled excerpt should include a `* TOC` line;
  otherwise the first ~50 words are used.
- **Default front-matter** via `defaults:` — `_posts/*` get `layout: post`,
  `comments: true`, `social-share: true`, `readtime: true`, `tex: false` (turn TeX
  on per-post when needed). Everything under `staged/` is treated as a post
  (`layout: post`, `published: true`). Everything else defaults to `layout: page`.
- **Excluded from the production build**: `drafts/`, `docs/`, `staged/*.py`,
  `staged/*.txt`, plus nix-shell files, README, CHANGELOG, etc. This means:
  - `drafts/` is a private scratch area — files there never appear on the live site.
  - `staged/` IS published (posts-in-progress), except the `.py`/`.txt` helpers
    alongside the markdown.
  - To "promote" a draft: move `drafts/` → `_posts/` (rename to
    `YYYY-MM-DD-title.md`) or → `staged/` for a softer publish.

## Theme structure (Beautiful Jekyll v6.0.1)

When editing chrome (header, footer, post layout, etc.) the relevant files are
upstream theme files — change them in-place rather than creating new ones.

- `_layouts/base.html` — root template; declares the
  `common-css`/`common-js`/`common-ext-css`/`common-ext-js` lists in its own
  front-matter. Extended by `default.html`, `post.html`, `page.html`, `home.html`,
  `minimal.html`.
- `_includes/` — `head.html`, `nav.html`, `header.html`, `footer.html`, plus
  per-integration partials (`disqus.html`, `gtag.html`, `gtm_*.html`, …). Most are
  gated by `_config.yml` flags being uncommented. Comments and tracking are
  currently OFF (comment widgets and Matomo gated to no-ops), but the
  `disqus.html` / `fb-comment.html` shells remain (calling unset config) in case a
  future backend lands. Planned future backend is Remark42 in `../site-setup` — see
  TODO in that repo's README.
- `_includes/mathjax.html` — local include, called from `head.html`. Loads MathJax
  v3 from `assets/js/mathjax/` only on pages with `tex: true` front-matter.
- `_includes/search.html` — modified upstream. Loads `assets/js/lunr.js` and
  `assets/js/site-search.js` instead of upstream's CDN `simple-jekyll-search`.
- `_data/ui-text.yml` — i18n strings used by the theme.

Navbar entries, social links, comment provider, and analytics are all wired
through `_config.yml` — prefer toggling config over editing includes.

## Search

The navbar search overlay is enabled by `post_search: true` in `_config.yml`. The
implementation is local (not upstream's `simple-jekyll-search`):

- `assets/data/searchcorpus.json` — built at site-build time. Excludes future-dated
  posts. Per-post fields: `id`, `title`, `subtitle`, `url`, `date`, `tags`,
  `thumbnail`, `excerpt`, `content`.
- `assets/js/lunr.js` — vendored Lunr 2.3.9.
- `assets/js/site-search.js` — fetches the corpus on first overlay open (or on
  `requestIdleCallback`), builds a Lunr index with field boosts (`url`/`title` ×10,
  `tags`/`subtitle` ×5, `excerpt` ×3, `content` default), supports prefix matching
  (`*`) and fuzzy edit-distance-1 (`~1`). Single-word queries run both `~1` and
  `*~1` and pick the better result set.
- `_includes/search.html` — the overlay markup (mostly upstream, swaps the scripts).
- `404.html` — "Search this site" button that opens the overlay with the broken
  slug pre-filled.

## Local customizations on top of v6.0.1

See `docs/theme-customizations.md` for the full inventory. Briefly:

- Relative URLs throughout (canonical, og:url, RSS, feed item links) so both origins
  work standalone.
- `assets/js/redirect.js` + `home/forwards.json` map renamed slugs (404 lookup
  chain).
- `_includes/header.html`: "Draft" label when `page.date` is absent (for `staged/`
  pages).
- `_includes/readtime.html`: word count instead of estimated minutes.
- `_layouts/home.html` + `tags.html`: hide future-dated posts.
- CSS tweaks in `assets/css/beautifuljekyll.css` (justified paragraphs, blockquote
  restyle, post-preview grayscale-on-hover, `.hidden`, search-result card styles).

## Conventions worth knowing

- Posts use kramdown + GFM with MathJax (`kramdown.math_engine: mathjax`). Set
  `tex: true` in a post's front-matter to load MathJax for that page.
- Pagination is 5 posts/page via `jekyll-paginate`.
- `home/forwards.json` and the various `home/*.md` pages are linked from the navbar;
  their paths are referenced verbatim in `_config.yml`'s `navbar-links`, so renaming
  a file means updating the config too.
- After changing Gemfile deps, regenerate the lockfile multi-platform with the
  docker one-liner above (works on both arm64-darwin and linux).
