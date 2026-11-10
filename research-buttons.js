// Research Hub: puts "Submit Research" and "Get books and materials" side by side in one row.
(function () {
  "use strict";
  function arrange() {
    var s = document.getElementById("submitOpen");
    var b = document.getElementById("booksLinkBtn");
    if (!s || !b) return false;
    if (s.parentElement && s.parentElement.classList.contains("rh-actions")) return true;
    var row = document.createElement("div");
    row.className = "rh-actions";
    s.parentNode.insertBefore(row, s);
    row.appendChild(s);
    row.appendChild(b);
    return true;
  }
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    if (arrange() || tries > 40) clearInterval(timer);
  }, 250);
})();
