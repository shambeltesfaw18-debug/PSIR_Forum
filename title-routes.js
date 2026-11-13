// Gives the Categories and Discussions views their own page titles (they share the home page).
(function () {
  "use strict";
  var titles = { "/categories": "Categories | PSIR Forum", "/discussions": "Discussions | PSIR Forum" };
  var t = titles[window.location.pathname];
  if (t) document.title = t;
})();
