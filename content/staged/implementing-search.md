---
layout: post
title: 'Searching through your GitHub page'
subtitle: a dynamic feature for static pages
tags:
- setup
- blog
---
I was looking through previous posts on my blog some time ago, and wanted to
quickly navigate from one to a specific other one. The fastest way is through
tags, but it felt quite unintuitive. Something more intuitive would have been a
search. But this is a statically built page, there is no way something like
search is possible. Or is it?

I googled for a bit, and found multiple approaches immediately. I tried a few,
but most of the simple ones were outdated, and I didn't want to try something
very complicated either. [This guide][post], while requiring adaptation,
ultimately worked.

* TOC
{:toc}

So I'll take you through my implementation, including the changes I made.

{% highlight javascript linenos %}
var foo = function(x) {
  return(x + 5);
}
foo(3)
{% endhighlight %}


---
[post]: https://learn.cloudcannon.com/jekyll/jekyll-search-using-lunr-js/
