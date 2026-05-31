// https://lea.verou.me/2016/11/url-rewriting-with-github-pages/
function xhr(o) {
  var x = new XMLHttpRequest();
  x.open("GET", o.src);
  x.onreadystatechange = function () {
    if (x.readyState == 4) {
      if (x.status < 400) {
        try {
          o.onsuccess.call(x);
        } catch (e) {
          o.onerror.call(x);
          console.error(e);
        }
      } else {
        o.onerror.call(x);
      }
    }
  };
  x.send();
}

(function () {
  var slug = location.pathname.slice(1).replace(/\/+$/, "");
  // Derive site root from this script's own src so baseurl-style deploys work.
  var thisScript = document.querySelector('script[src$="redirect.js"]');
  var base = thisScript.getAttribute('src').replace(/assets\/js\/redirect\.js$/, '');

  xhr({
    src: base + 'home/forwards.json',
    onsuccess: function () {
      var slugs = JSON.parse(this.responseText);
      var actual = slugs[slug];

      if (actual) {
        var url = base + actual;
        document.getElementById('redirecting').innerHTML =
          'Redirecting to <a href="' + url + '">' + url + '</a>...';
        location.href = url;
      } else {
        document.getElementById('redirecting').className = "hidden";
        document.getElementById('404').className = "text-center";
      }
    },
    onerror: function () {
      document.getElementById('redirecting').className = "hidden";
      document.getElementById('404').className = "text-center";
    }
  });
})();
