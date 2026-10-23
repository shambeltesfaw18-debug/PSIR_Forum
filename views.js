(function () {
  "use strict";

  const SECTIONS = ["home", "categories", "discussions", "about", "cta"];
  const HOME_SECTIONS = ["home", "about", "cta"];

  const NAV_MAP = {
    "#home": "/",
    "#discussions": "/discussions",
    "#categories": "/categories",
    "#live": "/live"
  };

  // Turns a category name into a web address part, e.g. "Political Science" -> "political-science"
  function slugify(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function parseRoute(pathname) {
    const path = pathname.replace(/\/+$/, "") || "/";
    if (path === "/") return { view: "home" };
    if (path === "/discussions") return { view: "forum" };
    if (path === "/categories") return { view: "categories" };
    if (path === "/live") return { view: "live" };
    if (path === "/bookmarks") return { view: "bookmarks" };
    const match = path.match(/^\/categories\/([a-z0-9-]+)$/);
    if (match) return { view: "category", slug: match[1] };
    return { view: "home", unknown: true };
  }

  function showSections(names) {
    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = names.includes(id) ? "" : "none";
    });
  }

  // A "back to categories" link shown only when a single category is open
  function setBackLink(visible) {
    let link = document.getElementById("psirBackToCategories");
    if (!link) {
      link = document.createElement("a");
      link.id = "psirBackToCategories";
      link.href = "/categories";
      link.textContent = "← All categories";
      link.style.cssText = "display:inline-block;margin:0 0 12px;font-weight:600;color:#1f6f78;";
      const discussions = document.getElementById("discussions");
      if (discussions) discussions.insertBefore(link, discussions.firstChild);
    }
    link.style.display = visible ? "inline-block" : "none";
  }

  function findCategoryCard(slug) {
    return Array.from(document.querySelectorAll(".category-card[data-category]"))
      .find(card => slugify(card.dataset.category) === slug) || null;
  }

  // Opens a category using the page's own category button, so existing behavior is reused
  let clicking = false;
  function openCategoryCard(slug, tries) {
    const card = findCategoryCard(slug);
    if (card) {
      clicking = true;
      card.click();
      clicking = false;
      return;
    }
    if ((tries || 0) < 20) {
      setTimeout(() => openCategoryCard(slug, (tries || 0) + 1), 300);
    }
  }

  function render(route, fromUserClick) {
    setBackLink(route.view === "category");

    switch (route.view) {
      case "home":
        showSections(HOME_SECTIONS);
        window.scrollTo({ top: 0, behavior: "auto" });
        break;

      case "categories":
        showSections(["categories"]);
        window.scrollTo({ top: 0, behavior: "auto" });
        break;

      case "forum":
        showSections(["discussions"]);
        window.scrollTo({ top: 0, behavior: "auto" });
        break;

      case "live":
        showSections(["discussions"]);
        window.scrollTo({ top: 0, behavior: "auto" });
        break;

      case "bookmarks":
        showSections(["discussions"]);
        setTimeout(() => {
          const control = document.querySelector('[data-action="bookmarks"], #footerBookmarks, #navBookmarks');
          if (control) control.click();
        }, 300);
        break;

      case "category":
        showSections(["discussions"]);
        if (!fromUserClick) openCategoryCard(route.slug, 0);
        break;
    }
  }

  function navigate(path) {
    if (location.pathname !== path) history.pushState(null, "", path);
    render(parseRoute(path), false);
  }

  // Clicks on category buttons and on internal links use the address bar, not a page reload
  document.addEventListener("click", event => {
    if (clicking) return;

    const card = event.target.closest && event.target.closest(".category-card[data-category]");
    if (card) {
      const slug = slugify(card.dataset.category);
      history.pushState(null, "", "/categories/" + slug);
      render({ view: "category", slug }, true);
      return;
    }

    const link = event.target.closest && event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href.startsWith("/") || href.startsWith("//")) return;

    const route = parseRoute(href);
    if (route.unknown) return; // other pages, such as info.html, load normally

    event.preventDefault();
    navigate(href);
  }, true);

  // Browser Back and Forward
  window.addEventListener("popstate", () => {
    render(parseRoute(location.pathname), false);
  });

  // Point the menu links at the new addresses
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const mapped = NAV_MAP[link.getAttribute("href")];
    if (mapped) link.setAttribute("href", mapped);
  });

  // Start: unknown addresses fall back to the home page
  const first = parseRoute(location.pathname);
  if (first.unknown) history.replaceState(null, "", "/");
  render(first.unknown ? { view: "home" } : first, false);
})();