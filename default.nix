# # Gemfile with:
# source 'https://rubygems.org'
# gem 'github-pages'
# # Then:
# $ nix-shell -p bundler
# $ bundler package --no-install --path vendor
# $ rm -rf .bundler vendor
# $ exit  # leave nix-shell
# # Next:
# > nix-build '<nixpkgs>' -A bundix
# > result/bin/bundix
# > nix-shell


with import <nixpkgs> { };

let jekyll_env = bundlerEnv {
    name = "jekyll_env";
    ruby = ruby_2_6;
    gemfile = ./Gemfile;
    lockfile = ./Gemfile.lock;
    gemset = ./gemset.nix;
  };
in
  stdenv.mkDerivation rec {
    name = "jekyll_env";
    buildInputs = [ jekyll_env ];

    shellHook = ''
      exec ${jekyll_env}/bin/jekyll serve --watch
    '';
  }
