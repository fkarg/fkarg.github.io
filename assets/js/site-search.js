// Lunr-backed full-content search for the navbar overlay.
// Replaces simple-jekyll-search. Loads the corpus once on first overlay open
// (or on idle), builds a Lunr index with field boosts, and handles input
// events to render result cards.
//
// Matching behaviour (mirrors the help blurb that used to live on /search):
//   * Every post with at least one word matching is shown
//   * Posts sorted by Lunr's TF/IDF match score
//   * Occurrences in url/title weighted ×10, tags/subtitle ×5, excerpt ×3
//   * Fuzzy matching at edit-distance 1 (`~1`)
//   * Prefix matching (`*`)
//   * For single-word queries: best-of-two between fuzzy and prefix+fuzzy

(function () {
  if (typeof lunr === 'undefined') {
    return; // page didn't load lunr — overlay won't search
  }
  if (!document.getElementById('beautifuljekyll-search-overlay')) {
    return; // overlay isn't on this page
  }

  var corpus = null;
  var idx = null;
  var byId = null;
  var loadStarted = false;
  var input = document.getElementById('nav-search-input');
  var resultsContainer = document.getElementById('search-results-container');
  var corpusUrl = (
    document.querySelector('script[src$="site-search.js"]').getAttribute('src')
      .replace(/assets\/js\/site-search\.js$/, '') + 'assets/data/searchcorpus.json'
  );

  function buildIndex(docs) {
    byId = {};
    for (var i = 0; i < docs.length; i++) byId[docs[i].id] = docs[i];

    idx = lunr(function () {
      this.ref('id');
      this.field('url', { boost: 10 });
      this.field('title', { boost: 10 });
      this.field('tags', { boost: 5 });
      this.field('subtitle', { boost: 5 });
      this.field('excerpt', { boost: 3 });
      this.field('content');
      for (var i = 0; i < docs.length; i++) this.add(docs[i]);
    });
  }

  function loadCorpus() {
    if (loadStarted) return;
    loadStarted = true;
    var x = new XMLHttpRequest();
    x.open('GET', corpusUrl);
    x.onreadystatechange = function () {
      if (x.readyState === 4 && x.status < 400) {
        try {
          corpus = JSON.parse(x.responseText);
          buildIndex(corpus);
          if (input.value) handleQuery(input.value);
        } catch (e) {
          console.error('site-search: corpus parse failed', e);
        }
      }
    };
    x.send();
  }

  function search(query) {
    if (!idx) return [];
    query = String(query).trim();
    if (!query) return [];

    var tokens = query.split(/\s+/);
    try {
      if (tokens.length > 1) {
        // each token gets prefix+fuzzy
        return idx.search(tokens.map(function (t) { return t + '*~1'; }).join(' '));
      }
      // single-word: pick whichever of fuzzy / prefix+fuzzy yields more
      var r1 = idx.search(tokens[0] + '~1');
      var r2 = idx.search(tokens[0] + '*~1');
      return r1.length > r2.length ? r1 : r2;
    } catch (e) {
      // Lunr throws on malformed queries (lone wildcard, etc.); fall back to literal.
      try { return idx.search(query); } catch (_) { return []; }
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderResult(item) {
    var html = '<li class="search-result"><a href="' + escapeHtml(item.url) + '">';
    html += '<div class="search-result-title">' + escapeHtml(item.title) + '</div>';
    if (item.subtitle) html += '<div class="search-result-subtitle">' + escapeHtml(item.subtitle) + '</div>';
    var meta = [];
    if (item.date) meta.push(escapeHtml(item.date));
    if (item.tags) meta.push(escapeHtml(item.tags));
    if (meta.length) html += '<div class="search-result-meta">' + meta.join(' · ') + '</div>';
    if (item.excerpt) html += '<div class="search-result-excerpt">' + escapeHtml(item.excerpt) + '</div>';
    html += '</a></li>';
    return html;
  }

  function handleQuery(query) {
    if (!idx) {
      resultsContainer.innerHTML = '<li class="search-status">Loading...</li>';
      return;
    }
    var results = search(query);
    if (!results.length) {
      resultsContainer.innerHTML = query
        ? '<li class="search-status">No matches for <code>' + escapeHtml(query) + '</code>.</li>'
        : '';
      return;
    }
    var html = '';
    for (var i = 0; i < results.length && i < 20; i++) {
      var item = byId[results[i].ref];
      if (item) html += renderResult(item);
    }
    resultsContainer.innerHTML = html;
  }

  input.addEventListener('input', function (e) { handleQuery(e.target.value); });

  // Trigger corpus load when the overlay first opens, or eagerly on idle.
  var link = document.getElementById('nav-search-link');
  if (link) link.addEventListener('click', loadCorpus);
  if ('requestIdleCallback' in window) requestIdleCallback(loadCorpus);
  else setTimeout(loadCorpus, 2000);
})();
