// https://lea.verou.me/2016/11/url-rewriting-with-github-pages/
function $(expr, con) {
    return typeof expr === 'string'? (con || document).querySelector(expr) : expr;
}

function $$(expr, con) {
    return Array.prototype.slice.call((con || document).querySelectorAll(expr));
}

function xhr(o) {
    var xhr = new XMLHttpRequest(o.src);

    xhr.open("GET", o.src);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status < 400) {
                try {
                    o.onsuccess.call(xhr);
                }
                catch (e) {
                    o.onerror.call(xhr);
                    console.error(e);
                }
            }
            else {
                o.onerror.call(xhr);
            }
        }
    };

    xhr.send();
}

(function(){

// document.div.className = 'redirecting';

var slug = location.pathname.slice(1).replace(/\/+$/, "");

xhr({
    src: '/home/forwards.json',
    onsuccess: function () {
        var slugs = JSON.parse(this.responseText);
        console.log("loaded slugs: ", slugs);

        var actual = slugs[slug];
        console.log("matched " + slug + ": " + actual);

        if (actual) {
            console.log("redirectiong to " + actual);
            // Redirect
            // var url = 'https://fkarg.me/' + actual; // absolute 
            var url = '/' + actual; // relative
            document.getElementById('redirecting').innerHTML = 'Redirecting to <a href="' + url + '">' + url + '</a>…';
            location.href = url;
        }
        else {
            document.getElementById('redirecting').className = "hidden";
            document.getElementById('404').className = "text-center";
        }
    },
    onerror: function () {
        //document.body.className = 'error json';
    }
});

})();

