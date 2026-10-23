(function () {
  "use strict";

  const HOME_SECTIONS = ["home", "categories", "about", "cta"];
  const FORUM_SECTIONS = ["discussions"];
  const ALL_SECTIONS = HOME_SECTIONS.concat(FORUM_SECTIONS);

  // Find which main section an element belongs to, e.g. the audio room lives in "discussions"
  function sectionOf(element) {
    let node = element;
    while (node && node !== document.body) {
      if (node.id && ALL_SECTIONS.includes(node.id)) return node.id;
      node = node.parentElement;
    }
    return "home";
  }

  function showView(viewName) {
    const visible = viewName === "forum" ? FORUM_SECTIONS : HOME_SECTIONS;
    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = visible.includes(id) ? "" : "none";
    });
  }

  function route(hash) {
    const target = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    const section = target ? sectionOf(target) : "home";
    const isForum = section === "discussions";
    showView(isForum ? "forum" : "home");

    requestAnimationFrame(() => {
      if (target && !isForum) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
  }

  // Menu links and in-page links switch views without a page reload
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href");
    if (hash.length < 2) return;

    event.preventDefault();
    if (location.hash !== hash) history.pushState(null, "", hash);
    route(hash);
  }, true);

  // The browser's Back and Forward buttons
  window.addEventListener("hashchange", () => route(location.hash));

  route(location.hash || "#home");
})();