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
I started out by copying from [this blog post][nix-orig], and soon started
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
This will install `nix` as well as `nix-shell` and other `nix`-related binaries.

Yes, this is going to be the fastest way with the least amount of pain, even if
you haven't heard about `nix` before. You can learn more about nix on [the
website][nix-site], read about [how nix works][nix-guide] or one of the many
blogposts about [what nix is][nix-blog].

(You can also read more of my thoughts on nix [here][nixos])


## Original way
I'll tell you about my original setup, how to replicate it, and what I changed.
As mentioned earlier, it's mostly a copy from [this blog post][nix-orig]. It
doesn't build at the time of writing, but might very well do so again in the
future (or if you can resolve the dependency issue in some way).

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
While the `Gemfile` specifies our top-level dependencies, `github-pages` is
likely to have dependencies itself. We will use `bundler` to determine and
resolve them. Then, `bundix` will take the `Gemfile.lock` and convert it to a
nix expression -- which we can then use in our expression for the `shell.nix`
later.
```sh
$ nix-shell -p bundler bundix # enter environment with `bundler` and `bundix` available
$ bundler package --no-install --path vendor # execute bundler packaging
$ bundix # run bundix
$ rm -rf .bundle vendor # remove bundler artifacts
$ exit  # leave nix-shell environment
```

### Editing gemset.nix and Gemfile.lock
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

## Newfound Way
Well, since my original way didn't work anymore -- and I'm only using the
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
The nice thing is, it also exits the environment when stopping it -- I would
still need to do that manually when running `nix-shell -p`.


## Conclusion
Why make it simple, when you can make it complicated? In all earnesty though,
using the original way will work with all sorts of additional plugins and
configurations, which the newfound way won't. In my case, it doesn't need to.

## Tips and Tricks
- When you have your `shell.nix`, you can run the shell by executing `$
  nix-shell` in the same directory, and end it with `Strg+C`.
- When you make changes to your `_config.yml`, you need to stop the `nix-shell`
  and remove the `_site` directory. <!-- __ ... formatting. -->
- Within the `_config.yml` you can `exclude` paths and specific files from
  triggering a page rebuild or being available on navigation. I exclude e.g.
  the `README.md` or my `drafts/` folder with unfinished posts.
- If you're confused about `nix-shell`, see [this introduction to nix-shell][nix-shell].


---
[install-nix]: https://nixos.org/download.html#nix-quick-install
[nix-shell]: https://ghedam.at/15978/an-introduction-to-nix-shell
[blog]: https://fkarg.me
[nixos]: ../2020-06-10-nixos-starting/
[nix-site]: https://nixos.org
[nix-guide]: https://nixos.org/guides/how-nix-works.html
[nix-blog]: https://serokell.io/blog/what-is-nix
[nix-orig]: https://stesie.github.io/2016/08/nixos-github-pages-env
