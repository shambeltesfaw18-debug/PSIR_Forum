(function () {
  "use strict";

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const KMEET = "https://kmeet.infomaniak.com/PSIR-";

  const SECTIONS = ["home", "categories", "discussions", "about", "cta"];
  const VIEWS = {
    home: ["home", "categories", "about", "cta"],
    categories: ["categories"],
    forum: ["discussions"],
    category: ["discussions"]
  };
  const HASH_ROUTES = {
    "#home": "/",
    "#categories": "/categories",
    "#discussions": "/discussions",
    "#audio": "/discussions",
    "#about": "/"
  };

  if (!window.supabase) {
    console.error("pages.js: Supabase did not load.");
    return;
  }
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  function slugify(name) {
    return String(name || "").toLowerCase().replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function parse(pathname) {
    const path = (pathname || "/").replace(/\/+$/, "") || "/";
    if (path === "/") return { view: "home" };
    if (path === "/categories") return { view: "categories" };
    if (path === "/discussions" || path === "/live" || path === "/bookmarks") return { view: "forum" };
    const match = path.match(/^\/categories\/([a-z0-9-]+)$/);
    if (match) return { view: "category", slug: match[1] };
    return { view: "home", unknown: true };
  }

  function showView(view) {
    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = VIEWS[view].includes(id) ? "" : "none";
    });
  }

  // ---------- kMeet live room panel ----------
  const discussions = document.getElementById("discussions");
  const panel = document.createElement("section");
  panel.id = "psirRoom";
  panel.style.cssText = "margin:0 0 22px;padding:18px;border:1px solid #e2e8ef;border-radius:16px;background:#fff;display:none;";

  const panelTitle = document.createElement("h3");
  panelTitle.textContent = "Live room";
  panelTitle.style.cssText = "margin:0 0 6px;color:#102b46;";

  const info = document.createElement("p");
  info.style.cssText = "margin:0 0 12px;color:#64748b;";

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;align-items:center;";

  const roomBox = document.createElement("div");
  panel.append(panelTitle, info, actions, roomBox);

  if (discussions) {
    const layout = discussions.querySelector(".community-layout");
    if (layout && layout.parentNode) {
      layout.parentNode.insertBefore(panel, layout);
    } else {
      discussions.appendChild(panel);
    }
  }

  let loggedIn = false;
  let roomCategory = null;
  let roomView = false;
  let roomOpen = false;

  function makeButton(label, onClick, secondary) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText = "padding:10px 16px;border-radius:999px;border:none;font-size:15px;font-weight:600;cursor:pointer;" +
      (secondary ? "background:#e7eaf0;color:#102b46;" : "background:#102b46;color:#fff;");
    b.addEventListener("click", onClick);
    return b;
  }

  function closeRoom() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    roomBox.innerHTML = "";
    roomOpen = false;
  }

  function openRoom() {
    if (!roomCategory) return;
    roomBox.innerHTML = "";
    const frame = document.createElement("iframe");
    frame.src = KMEET + roomCategory.slug;
    frame.title = "PSIR live room";
    frame.allow = "camera; microphone; fullscreen; display-capture; autoplay";
    frame.style.cssText = "width:100%;height:70vh;min-height:420px;border:0;border-radius:12px;margin-top:12px;background:#000;";
    roomBox.appendChild(frame);
    roomOpen = true;
    renderRoom();
  }

  function fullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    const request = roomBox.requestFullscreen || roomBox.webkitRequestFullscreen;
    if (request) request.call(roomBox).catch(() => {});
  }

  function renderRoom() {
    panel.style.display = roomView ? "block" : "none";
    if (!roomView) return;

    actions.innerHTML = "";

    if (!roomCategory) {
      info.textContent = "This category has no live room yet.";
      return;
    }
    if (!loggedIn) {
      info.textContent = "Log in to join the live room for " + roomCategory.name + ".";
      return;
    }

    if (roomOpen) {
      info.textContent = "You are in the live room for " + roomCategory.name + ".";
      actions.append(
        makeButton("Full screen", fullScreen),
        makeButton("Leave room", () => { closeRoom(); renderRoom(); }, true)
      );
    } else {
      info.textContent = "Join the video and audio room for " + roomCategory.name +
        ". Your microphone and camera start off.";
      actions.append(makeButton("Join live room", openRoom));
    }

    const link = document.createElement("a");
    link.href = KMEET + roomCategory.slug;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open in a new tab";
    link.style.cssText = "color:#1f6f78;font-weight:600;";
    actions.append(link);
  }

  let categoriesPromise = null;
  function loadCategories() {
    if (!categoriesPromise) {
      categoriesPromise = db.from("categories").select("name, slug").then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }).catch(error => {
        categoriesPromise = null;
        throw error;
      });
    }
    return categoriesPromise;
  }

  // ---------- routing ----------
  let programmatic = false;

  // Uses the page's own category card, so the discussion filter stays in sync
  function selectCategoryCard(name) {
    const card = Array.from(document.querySelectorAll(".category-card[data-category]"))
      .find(c => c.dataset.category === name);
    if (!card) return false;
    programmatic = true;
    card.click();
    programmatic = false;
    return true;
  }

  async function route(pathname, hash) {
    const parsed = parse(pathname);
    showView(parsed.view);
    roomView = parsed.view === "category";

    if (parsed.view === "home") {
      closeRoom();
      roomCategory = null;
      renderRoom();
      window.scrollTo({ top: 0, behavior: "auto" });
      if (hash === "#about") {
        const about = document.getElementById("about");
        if (about) about.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (parsed.view === "categories") {
      closeRoom();
      roomCategory = null;
      renderRoom();
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (parsed.view === "forum") {
      closeRoom();
      roomCategory = null;
      renderRoom();
      window.scrollTo({ top: 0, behavior: "auto" });
      if ((pathname || "").replace(/\/+$/, "") === "/bookmarks") {
        const control = document.getElementById("footerBookmarks");
        if (control) {
          programmatic = true;
          control.click();
          programmatic = false;
        }
      }
      return;
    }

    // Single category
    window.scrollTo({ top: 0, behavior: "auto" });
    try {
      const categories = await loadCategories();
      const found = categories.find(c => slugify(c.name) === parsed.slug) || null;
      if (!roomCategory || !found || roomCategory.slug !== found.slug) closeRoom();
      roomCategory = found;
      if (found) selectCategoryCard(found.name);
    } catch (error) {
      console.error("pages.js: could not load categories", error);
      roomCategory = null;
      info.textContent = "The live room could not load: " + (error.message || "unknown error");
    }
    renderRoom();
  }

  function navigate(path, hash) {
    const url = path + (hash === "#about" ? "#about" : "");
    if (location.pathname + location.hash !== url) history.pushState(null, "", url);
    route(path, hash);
  }

  // Clicks on category cards, internal links, and menu links
  document.addEventListener("click", event => {
    if (programmatic) return;

    const card = event.target.closest && event.target.closest(".category-card[data-category]");
    if (card) {
      const path = "/categories/" + slugify(card.dataset.category);
      if (location.pathname !== path) history.pushState(null, "", path);
      route(path);
      return;
    }

    const link = event.target.closest && event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");

    if (href.startsWith("#")) {
      const mapped = HASH_ROUTES[href];
      if (!mapped) return;
      event.preventDefault();
      navigate(mapped, href);
      return;
    }

    if (href.startsWith("/") && !href.startsWith("//")) {
      if (parse(href).unknown) return;
      event.preventDefault();
      navigate(href);
    }
  }, true);

  window.addEventListener("popstate", () => route(location.pathname, location.hash));

  // Sign-in state updates the kMeet panel
  db.auth.getSession().then(({ data }) => {
    loggedIn = !!data.session;
    renderRoom();
  });

  db.auth.onAuthStateChange((_event, session) => {
    loggedIn = !!session;
    setTimeout(renderRoom, 0);
  });

  // Start: unknown addresses go to the home page
  if (parse(location.pathname).unknown) {
    history.replaceState(null, "", "/");
  }
  route(location.pathname, location.hash);
})();