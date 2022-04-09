---
layout: post
title: 'Local development with GitHub pages'
subtitle: running jekyll locally with a few simple steps
tags:
- setup
- blog
---
When making visual changes on [my blog][blog], I used to _make a commit_ and
_wait_ until GitHub pages rebuilt and published the site again. This takes
somewhere between half a minute and up to several minutes. It works, but
requires a lot of waiting and iterations to reach satisfactory results. At some
point, I just googled how to run jekyll locally on [NixOS][nixos].

In this post, I will give you some resources and ideas how to do it yourself.
Feel free to follow what works, and ignore what does not. You don't need to be
on `NixOS` -- all you need is `nix`, and I'll show you how.

* TOC
{:toc}
---

### Early Beginnings
I started out by copying from [this blog post][nix-orig-unarch], and soon started
making changes here and there.

In preparation for this post, I tried to reproduce and update my original
setup, and I spectacularly failed rebuilding it: `nokogiri`, a dependency of
the `github-pages`-gem suddenly had a different hash than expected. Ultimately,
I couldn't resolve it and decided to simplify my setup.

Regardless, the goal is to enable execution of `jekyll serve --watch
--incremental` in a `nix-shell` environment, so that I don't need to have
anything installed locally.

I'll show you both the original way with my adaptations (which is potentially
more flexible), as well as my newfound setup -- which might actually be faster!

### Installing nix
Whichever way you want to follow later, you might want to [install
`nix`][install-nix] first:
```sh
$ curl -L https://nixos.org/nix/install | sh
```
This will install `nix` and related binaries, we'll be using `nix-shell`
specifically. You might need to add a [channel][nix-channel] for a fresh
install.

This is going to be the fastest way with the least amount of pain, if you don't
have have `ruby` and `bundle` set up. Either way, you might want to take a look
at [GitHub's site on testing locally][testing-locally].

You can learn more about nix on [the website][nix-site], read about [how nix
works][nix-guide] or one of the many blogposts about [what nix is][nix-blog].
(You can also read more of my thoughts on nix [here][nixos])


## Original way
I'll tell you about my original setup, how to replicate it, and what I changed.
As mentioned earlier, it's mostly a copy from [this blog post][nix-orig]. It
doesn't build at the time of writing, but might very well do so again in the
future (or if you can resolve the dependency issue in some way).

You can also skip ahead to the [newfound way](#newfound-way) directly -- the
original way didn't end up working again, after all.

### Gemfile
The `Gemfile` specifies the source of ruby dependencies as well as packages.
You probably have a `Gemfile` with dependencies (e.g. your theme) for your page
already.

Turns out there already is a gem with everything needed to build `github-pages`
locally, so we're going to package that. Let's write the `Gemfile` for that:
```py
# file: Gemfile
source 'https://rubygems.org'
gem 'github-pages'
```
As it is different from the `Gemfile` of my github pages site, I temporarily
replaced it, and later saved this one as `Gemfile-nix-shell` - but I'll tell
you when to do this.

### Packaging and Building
While the `Gemfile` specifies our top-level dependencies, `github-pages` has
dependencies itself. We will use `bundler` to determine and resolve them. Then,
`bundix` will take the `Gemfile.lock` and convert it to a nix expression --
which we can then use in our `shell.nix`-expression later.

```sh
$ nix-shell -p bundler bundix # enter environment with `bundler` and `bundix` available
$ bundler package --no-install --path vendor # execute bundler packaging
$ bundix # run bundix
$ rm -rf .bundle vendor # remove bundler artifacts
$ exit  # leave nix-shell environment
```

### shell.nix
Now let's build our `shell.nix` building the `gemset.nix` expression based on
the `Gemfile.lock` lockfile. At this point, I renamed my `Gemfile` to
`Gemfile-nix-shell`, to be able to have it and the original `Gemfile` in the
repository - GitHub pages won't build with the modified `Gemfile`.
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

### Editing gemset.nix and Gemfile.lock
If `nix-shell` succeeds -- lucky you! The issue I had got fixed.

If not -- you should see something similar to this:
```sh
error: hash mismatch in fixed-output derivation '/nix/store/pdnlvva6xrzs5m4g8s81xx4bizsvrb8l-nokogiri-1.13.3.gem.drv':
         specified: sha256-P2NAZhwqKDszfSJ+oiT4WWI3dbL1wJpr8Ze3hlY5WN8=
            got:    sha256-vxsbzv+RCrsLetglU1lREBoDYbhZwq0b4VXAEAgey9w=
error: 1 dependencies of derivation '/nix/store/dfvq6ppw9i7xf869z68vcx9j7lvmvbw6-ruby2.7.5-nokogiri-1.13.3.drv' failed to build
error: 1 dependencies of derivation '/nix/store/4ybs0rncdzn2z8dgc6bfd2ifsy3zfbvr-jekyll_env.drv' failed to build
```

`gemset.nix` nixifies `Gemfile.lock`, which locks dependencies at a given point
in time. They are not intended to be edited manually, but since I had 
<!--
```nix
# file: gemset.nix
  mini_portile2 = {
    groups = ["default"];
    platforms = [];
    source = {
      remotes = ["https://rubygems.org"];
      sha256 = "0xg1x4708a4pn2wk8qs2d8kfzzdyv9kjjachg2f1phsx62ap2rx2";
      type = "gem";
    };
    version = "2.5.1";
  };
  nokogiri = {
    dependencies = ["mini_portile2" "racc"];
    groups = ["default"];
    platforms = [];
    source = {
      remotes = ["https://rubygems.org"];
      sha256 = "19d78mdg2lbz9jb4ph6nk783c9jbsdm8rnllwhga6pd53xffp6x0";
      type = "gem";
    };
    version = "1.11.3";
  };
```

```yml
# file: Gemfile.lock
    mini_portile2 (2.5.1)
    nokogiri (1.11.3)
      mini_portile2 (~> 2.5.0)
```
-->


## Newfound Way
Since my original setup didn't work anymore -- and I'm only using the
`jekyll-paginate` plugin -- it should be possible to use directly packaged
`jekyll`. And indeed, this works:
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
We saw how my setup worked originally, and how it works now. For the time
being, I don't care about fixing the old setup -- I found something better
after all. Do tell me if you find something even better!

Don't use this for production deployment though! I use the official
`jekyll/jekyll` docker image on my [server][server-setup]
([blog.fkarg.de][blog-de]) behind [traefik][traefik].


## Tips and Tricks
- When you have your `shell.nix`, you can run the shell by executing `$
  nix-shell` in the same directory, and end it with `Strg+C`.
- When you make changes to your `_config.yml`, you need to stop the `nix-shell`
  and remove the `_site` directory before restarting `nix-shell` again.
- Within the `_config.yml` you can [exclude][exclude] paths and specific files
  from triggering a page rebuild or being available on navigation. I exclude
  e.g.  the `README.md` or my `drafts/` folder with unfinished posts.
- If you're confused about `nix-shell`, see [this introduction to nix-shell][nix-shell].
- Even if your server is runnig locally doesn't mean all of your resources are
  local and available offline. My site used to have many external `javascript`
  and `css` dependencies, which aren't available without internet, making it
  look very weird and mostly unfunctional when offline.


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
