# frozen_string_literal: true

source "https://rubygems.org"

# Theme is consumed directly from this checkout via the gemspec.
gemspec

# Match the GitHub Pages production runtime locally.
gem 'github-pages', group: :jekyll_plugins
gem 'jekyll-redirect-from'

# webrick is no longer bundled with Ruby >= 3.0 but Jekyll's dev server needs it.
gem 'webrick', '~> 1.8'
