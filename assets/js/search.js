(function() {
    function displaySearchResults(results, store) {
        var searchResults = document.getElementById('search-results');
        if (results.length) { // Are there any results?
            var appendString = '';

            for (var i = 0; i < results.length; i++) { // Iterate over the results
                var item = store[results[i].ref];
                appendString += '<article class="post-preview">'
                appendString += '<a href="' + item.url + '"><h2 class="post-title">' + item.title +
                    '</h2>';
                appendString += '<h3 class="post-subtitle">' + item.subtitle + '</h3></a>';
                appendString += '<p class="post-meta"> Posted on ' + item.date + '</p>';
                if (item.thumbnail != "") {
                    appendString +=
                        '<div class="post-entry-container"><div class="post-image"><a href="' + item.url +
                        '"><img src="' + item.thumbnail + '"></a></div>';
                }
                appendString += '<div class="post-entry">' + item.post_entry + '<a href="' + item.url +
                    '" class="post-read-more">[Read&nbsp;More]</a></div>';
                appendString += '</div>';
                appendString += '<div class="blog-tags">Tags: ' + item.tags + '</div>';
                appendString += '</article>';
            }

            searchResults.innerHTML = appendString;
        } else {
            searchResults.innerHTML = 'No post with these words found.';
        }
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');

            if (pair[0] === variable) {
                return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
            }
        }
    }

    var searchTerm = getQueryVariable('query');

    if (searchTerm) {
        document.getElementById('search-box').setAttribute("value", searchTerm);

        // Initalize lunr with the fields it will be searching on. I've given title
        // a boost of 10 to indicate matches on this field are more important.
        var idx = lunr(function() {
            this.field('id');
            this.field('url', { boost: 10 });
            this.field('title', { boost: 10 });
            this.field('tags', { boost: 5 });
            this.field('subtitle', { boost: 5 });
            this.field('post_entry', { boost: 3 });
            this.field('content');
            for (var key in window.store) {
                this.add({
                    'id': key,
                    'title': window.store[key].title,
                    'tags': window.store[key].tags,
                    'url': window.store[key].url,
                    'subtitle': window.store[key].subtitle,
                    'post_entry': window.store[key].post_entry,
                    'content': window.store[key].content
                });
            }
        });

        searchTerm = searchTerm.split(' ').join('*~1 ');
        // console.log("searching for: " + searchTerm);

        results = '';
        if (searchTerm.split(' ').length > 1) {
            results = idx.search(searchTerm + '*~1'); // Get lunr to perform a search
        } else {
            results1 = idx.search(searchTerm + '~1'); // Get lunr to perform a search
            results2 = idx.search(searchTerm + '*~1'); // Get lunr to perform a search
            results = results1.length > results2.length ? results1 : results2;
        }
        displaySearchResults(results, window.store);
    }
})();
