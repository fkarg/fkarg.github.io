---
layout: post
title: 'Local development with GitHub pages'
subtitle: running jekyll locally with a few simple steps
tags:
- setup
- blog
---
When making visual changes on [my blog][blog], I used to _make a commit_ and
_wait_ until GitHub pages rebuilt and published the site again. While this
certainly works, it requires a lot of waiting and iterations, until I can reach
a satisfactory result. At some point, I just googled.

* TOC
{:toc}

And what I found didn't disappoint me. I started out by completely copying from
[https://stesie.github.io/2016/08/nixos-github-pages-env](https://stesie.github.io/2016/08/nixos-github-pages-env),
but I soon begun making small changes here and there.

In preparation for this post, I tried to reproduce and update my original
setup, and I spectacularly failed rebuilding it: nokogiri, a dependency of the
`github-pages`-gem suddenly had a different hash than expected. Ultimately, I
couldn't resolve it and decided to simplify my setup.

<!--
### Nix
First up: if you don't have it yet, you need to [install nix][install-nix]:
```sh
$ curl -L https://nixos.org/nix/install | sh
```
Yes, this is going to be the fastest way with the least amount of pain, even if
you haven't heard about `nix` before.


### Gemfile
Turns out there is a gem with everything needed to build `github-pages` in it,
so we're going to package that. Let's write the `Gemfile` for that:

```py
source 'https://rubygems.org'
gem 'github-pages'
```
As it is different from the `Gemfile` of my github pages site, I temporarily
replaced it, and later saved it as `Gemfile-nix-shell` - but I'll tell you when
to do this.

```sh
$ nix-shell -p bundler bundix # enter environment with `bundler` and `bundix` available
$ bundler package --no-install --path vendor # execute bundler packaging
$ bundix # run bundix
$ rm -rf .bundle vendor # remove bundler artifacts
$ exit  # leave nix-shell environment
$ nix-shell # starting jekyll
```
-->

Or, you can simply run:
```sh
$ nix-shell -p jekyll rubyPackages.jekyll-paginate
$ jekyll serve --watch --incremental
```
and turning it in a `shell.nix`:

```nix
with import <nixpkgs> { };

mkShell {
  buildInputs = [
    jekyll
    rubyPackages.jekyll-paginate
  ];
  shellHook = ''
      exec jekyll serve --watch --incremental
  '';
}
```



[introduction to nix-shell][nix-shell].


---
[install-nix]: https://nixos.org/download.html#nix-quick-install
[nix-shell]: https://ghedam.at/15978/an-introduction-to-nix-shell
[blog]: https://fkarg.me
