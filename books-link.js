// Adds a visible "Get books and materials" button on the Research Hub, beside Submit Research.
(function () {
  "use strict";
  function add() {
    if (document.getElementById("booksLinkBtn")) return;
    const target = Array.from(document.querySelectorAll("a, button")).find(el => el.textContent.trim() === "Submit Research");
    if (!target) return;
    const a = document.createElement("a");
    a.id = "booksLinkBtn";
    a.href = "/books.html";
    a.textContent = "Get books and materials";
    a.className = "psir-btn psir-navy psir-lg";
    a.style.marginLeft = "10px";
    a.style.fontWeight = "800";
    target.insertAdjacentElement("afterend", a);
  }
  add();
  new MutationObserver(add).observe(document.body, { childList: true, subtree: true });
})();
