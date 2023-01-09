---
layout: post
title: 'Local development with GitHub pages'
subtitle: running jekyll locally with a few simple steps
cover-img: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Jekyll_%28software%29_Logo.png'
tags:
- setup
- blog
---
When making (visual) changes on [my blog][blog], I used to _make a commit_ and
_wait_ until GitHub pages rebuilt and published the site again, before I could
verify that I liked the change or if I should modify it further. A single
iteration often took several minutes. It worked, but requires a lot of waiting
and iterations to reach satisfactory results. At some point, I just googled how
to run jekyll locally (on [NixOS][nixos]).

In this post, I will give you some resources and ideas how to run jekyll .
Feel free to follow what works, and ignore what does not. You don't need to be
on `NixOS` -- all you need is `nix`, and I'll show you how.

* TOC
{:toc}
---

### Context
Originally, I started out with the approach described in [this blog
post I found][nix-orig-unarch]. As the exact way didn't work, I did some
troubleshooting and fixed all issues that popped up.

In preparation for this post, I tried to retrace these steps, and I
spectacularly failed rebuilding it (`nokogiri`, a dependency of the
`github-pages`-gem has a different hash than expected. I figured out a way to
solve it originally, but I gave up on it. Don't fret, I found a better solution).

The goal is to run `jekyll serve --watch --incremental` in a `nix-shell`
environment, so that I don't need to have anything installed locally.

I'll explain the original way with my adaptations (which is potentially
more flexible), as well as my newfound setup -- which is a lot faster!

### Package Manager `nix`
In case of unfamiliarity with `nix`, you can learn more about it on [their
website][nix-site], read about [how nix works][nix-guide] or one of the many
blogposts about [what nix is][nix-blog]
(Also check out [my thoughts on nix here][nixos]).


The [official way to install `nix`][install-nix] is (yes I know ...):
```sh
$ curl -L https://nixos.org/nix/install | sh
```
This will install `nix` and its related binaries. In particular, we will be
using `nix-shell`, which provides a local virtual environment with certain
(additional) packages available. You probably need to add a [channel][nix-channel]
for a fresh install.


This is going to be the fastest way with the least amount of pain, if you don't
have have `ruby` and `bundle` set up. Either way, you might still want to take
a look at [GitHub's site on testing locally][testing-locally] this is
fundamentally based on.


## Original way
I'll tell you about my original setup, how to replicate it, and what I changed.
As mentioned earlier, it is mostly a copy from [this blog post][nix-orig]. It
doesn't build at the time of writing, but might very well do so again in the
future, or if you can resolve the dependency issue in some way.

Feel free to skip ahead to the [newfound way](#a-better-way) directly -- the
original way didn't end up working again, after all.

First, some explanations.

### Gemfile
A `Gemfile` specifies the source of ruby (a programming language) package
dependencies (gems). You probably have a `Gemfile` with dependencies (e.g. your
theme) for your page in your repository.

Turns out there exists a single package with everything needed to build
`github-pages` locally, so we're going to use it. The Gemfile for it would look
like this:
```py
# file: Gemfile
source 'https://rubygems.org'
gem 'github-pages'
```
As it is different from the `Gemfile` of my github pages site, I temporarily
replaced it (ensure that you don't commit that change), and later saved this
one as `Gemfile-nix-shell` -- I'll tell you when to do that.

### Packaging and Building
The `Gemfile` specifies our top-level dependencies, but `github-pages` has
dependencies itself. We will use `bundler` to determine and resolve them. Then,
`bundix` will take the `Gemfile.lock` and convert it to a nix expression --
which we can then use in our `shell.nix`-expression later. For that:

```sh
$ nix-shell -p bundler bundix  # enter environment with `bundler` and `bundix` available
$ bundler package --no-install --path vendor  # execute bundler packaging, this creates e.g. Gemfile.lock
$ bundix  # run bundix
$ rm -rf .bundle vendor  # remove bundler artifacts
$ exit  # leave nix-shell environment
```

### shell.nix
The `nix-shell` provides us with an environment of packages we can specify. We
can also use a `shell.nix`-file to provide them in a more deterministic way.
When we build a `shell.nix`, we can import the `gemset.nix` expression based on
the `Gemfile.lock` lockfile. At this point, I renamed my `Gemfile` to
`Gemfile-nix-shell`, to be able to have it and the original `Gemfile` in the
repository - GitHub pages will not build with the modified `Gemfile` for
`shell-nix`.
```nix
# file: shell.nix
with import <nixpkgs> { };

let jekyll_env = bundlerEnv {
    name = "jekyll_env";
    ruby = ruby_2_6;
    gemfile = ./Gemfile-nix-shell;
    lockfile = ./Gemfile.lock;
    gemset = ./gemset.nix;
  };
in
  stdenv.mkDerivation rec {
    name = "jekyll_env";
    buildInputs = [ jekyll_env ];

    shellHook = ''
      exec ${jekyll_env}/bin/jekyll serve --watch --incremental
    '';
  }
```
With that, we can then finally run it:
```sh
$ nix-shell # building and starting local jekyll server
```
Usually, `nix-shell` just provides a shell with the requested packages
additionally in context. Using the `shellHook` we can instead directly execute
a command, in our case the one to run `jekyll`.

### Fixing gemset.nix and Gemfile.lock
If `nix-shell` succeeds -- lucky you! The issue I had got fixed.

If not -- you should see something similar to this:
```sh
error: hash mismatch in fixed-output derivation '/nix/store/pdnlvva6xrzs5m4g8s81xx4bizsvrb8l-nokogiri-1.13.3.gem.drv':
         specified: sha256-P2NAZhwqKDszfSJ+oiT4WWI3dbL1wJpr8Ze3hlY5WN8=
            got:    sha256-vxsbzv+RCrsLetglU1lREBoDYbhZwq0b4VXAEAgey9w=
error: 1 dependencies of derivation '/nix/store/dfvq6ppw9i7xf869z68vcx9j7lvmvbw6-ruby2.7.5-nokogiri-1.13.3.drv' failed to build
error: 1 dependencies of derivation '/nix/store/4ybs0rncdzn2z8dgc6bfd2ifsy3zfbvr-jekyll_env.drv' failed to build
```

`gemset.nix` is a `nix`-transformed version of the `Gemfile.lock`, which locks
ruby dependencies at a given point in time. They are not intended to be edited
manually, but I remember succeeding by doing so. It was more complicated than
doing just that, but it wasn't that much more complicated.

{: .box-warning}
I'm sorry, I couldn't reconstruct what I did. At this point you're on your own.

{: .box-note}
But you don't have to. You can just do what I'm doing now instead.


## A Better Way
Since my original setup didn't work anymore -- and I'm only using the
`jekyll-paginate` plugin -- it should be possible to use fully packaged
`jekyll` directly. And indeed, doing this just works:
```sh
$ nix-shell -p jekyll rubyPackages.jekyll-paginate
$ jekyll serve --watch --incremental
```
Which, when transformed in a `shell.nix` looks like this:

### shell.nix
```nix
# file: shell.nix
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

Not only does this automatically exit the environment when stopping it (e.g.
via `CTRL+C`), but it also rebuilds sites faster on all my machines.
With our `shell.nix` written, we can just run `nix-shell` instead.

(If you want to try and compare both approaches, you can rename either
`shell.nix` to something other than `shell.nix` and specify the filename later
with `nix-shell <filename>`. `shell.nix` is just the default.)


## Conclusion
You hopefully learned a bit about the different parts necessary to build github
pages locally, even if they are mostly abstracted away.
Tell me if you find something even better!

Don't use this for production deployment though! I use the official
`jekyll/jekyll` docker image on my [server][server-setup]
([blog.fkarg.de][blog-de]) behind [traefik][traefik].


## Tips and Tricks
- When you have your `shell.nix`, you can run the shell by executing `$
  nix-shell` in the same directory, and end it with `STRG+C`.
- When you make changes to your `_config.yml`, you need to stop the `nix-shell`
  and remove the `_site` directory before you can see the changes when
  restarting `nix-shell` again.
    - This is also true when you create or remove a file in `_posts`. Updating works fine
- Within the `_config.yml` you can [exclude][exclude] paths and specific files
  from triggering a page rebuild or being available on navigation. I exclude
  e.g.  the `README.md` or a `drafts/` folder.
- If you're confused about `nix-shell`, see [this introduction to nix-shell][nix-shell].
- Even with the `jekyll` server runnig locally, this doesn't mean all of your
  resources are local and available offline. My site used to have many external
  `javascript` and `css` dependencies, which aren't available without internet,
  making it look very weird and mostly unfunctional when offline.


---
[install-nix]: https://nixos.org/download.html#nix-quick-install
[nix-shell]: https://ghedam.at/15978/an-introduction-to-nix-shell
[blog]: https://fkarg.me
[blog-de]: https://blog.fkarg.de
[nixos]: ../2020-06-10-nixos-starting/
[nix-site]: https://nixos.org
[nix-guide]: https://nixos.org/guides/how-nix-works.html
[nix-blog]: https://serokell.io/blog/what-is-nix
[nix-orig]: https://web.archive.org/web/20220408230918/https://stesie.github.io/2016/08/nixos-github-pages-env
[nix-channels]: https://nixos.wiki/wiki/Nix_channels
[nix-orig-unarch]: https://stesie.github.io/2016/08/nixos-github-pages-env
[server-setup]: ../2022-XX-XX-current-server-setup/
[traefik]: https://doc.traefik.io/traefik/
[exclude]: https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll
[testing-locally]: https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll
