// Client-side site search. Loads the prebuilt lunr index from
// assets/search-index.json, runs queries on input, and renders results that
// link to the matching cheatsheet page (and section anchor where available).
// The Jekyll baseurl is read from window.SEARCH_BASEURL (injected by
// search.html) so links and the index fetch resolve both locally and on Pages.
(function () {
  "use strict";

  var baseurl = window.SEARCH_BASEURL || "";
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  if (!input || !results) {
    return;
  }

  var index = null;
  var docsById = {};

  function render(hits) {
    results.innerHTML = "";
    if (!hits.length) {
      var empty = document.createElement("li");
      empty.textContent = "No results.";
      results.appendChild(empty);
      return;
    }
    hits.forEach(function (hit) {
      var doc = docsById[hit.ref];
      if (!doc) {
        return;
      }
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = baseurl + "/" + doc.url + (doc.anchor || "");
      a.textContent = doc.section ? doc.title + " — " + doc.section : doc.title;
      li.appendChild(a);
      results.appendChild(li);
    });
  }

  function search(query) {
    if (!index || !query.trim()) {
      results.innerHTML = "";
      return;
    }
    var hits;
    try {
      hits = index.search(query);
    } catch (e) {
      // Fall back to a prefix/wildcard query for partial input lunr would
      // otherwise reject (e.g. trailing special characters). Strip lunr
      // operators and drop terms that reduce to nothing, so an all-special
      // query (e.g. "*" or "+") does not produce a bare "*" lunr rejects again.
      var fallback = query
        .trim()
        .split(/\s+/)
        .map(function (term) {
          return term.replace(/[~^:*+\-]/g, "");
        })
        .filter(Boolean)
        .map(function (term) {
          return term + "*";
        })
        .join(" ");
      if (!fallback) {
        render([]);
        return;
      }
      try {
        hits = index.search(fallback);
      } catch (e2) {
        render([]);
        return;
      }
    }
    render(hits.slice(0, 20));
  }

  fetch(baseurl + "/assets/search-index.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      index = lunr.Index.load(data.index);
      data.docs.forEach(function (doc) {
        docsById[doc.id] = doc;
      });
      input.disabled = false;
      if (input.value) {
        search(input.value);
      }
    })
    .catch(function () {
      results.innerHTML = "";
      var li = document.createElement("li");
      li.textContent = "Search index could not be loaded.";
      results.appendChild(li);
    });

  input.addEventListener("input", function () {
    search(input.value);
  });
})();
