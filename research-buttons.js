// Research Hub: keeps "Submit Research" and "Get books and materials" together in one row,
// even when the second button is added after the page loads.
(function () {
  "use strict";
  function arrange() {
    var s = document.getElementById("submitOpen");
    var b = document.getElementById("booksLinkBtn");
    if (!s) return;
    var row = s.parentElement && s.parentElement.classList.contains("rh-actions") ? s.parentElement : null;
    if (!row) {
      row = document.createElement("div");
      row.className = "rh-actions";
      s.parentNode.insertBefore(row, s);
      row.appendChild(s);
    }
    if (b && b.parentElement !== row) row.appendChild(b);
  }
  arrange();
  var runs = 0;
  var timer = setInterval(function () {
    arrange();
    runs++;
    if (runs > 80) clearInterval(timer);
  }, 400);
})();
