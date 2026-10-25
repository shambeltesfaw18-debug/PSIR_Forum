(function () {
  "use strict";

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const KMEET = "https://kmeet.infomaniak.com/PSIR-";

  const SECTIONS = ["home", "categories", "discussions", "about", "cta"];
  const VIEWS = {
    home: ["home", "about", "cta"],
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

  // ---------- Rooms module (one card, two options) ----------
  const discussions = document.getElementById("discussions");
  const panel = document.createElement("section");
  panel.id = "psirRooms";
  panel.style.cssText = "margin:0 0 22px;padding:18px;border:1px solid #e2e8ef;border-radius:16px;background:#fff;display:none;";

  const panelTitle = document.createElement("h3");
  panelTitle.textContent = "Rooms";
  panelTitle.style.cssText = "margin:0 0 4px;color:#102b46;";

  const info = document.createElement("p");
  info.style.cssText = "margin:0 0 14px;color:#64748b;";

  const options = document.createElement("div");
  options.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;";

  const roomBox = document.createElement("div");
  panel.append(panelTitle, info, options, roomBox);

  if (discussions) {
    const layout = discussions.querySelector(".community-layout");
    if (layout && layout.parentNode) {
      layout.parentNode.insertBefore(panel, layout);
    } else {
      discussions.appendChild(panel);
    }
  }

  const ROOM_TYPES = {
    video: {
      title: "Video discussion",
      text: "Camera and microphone on. For debates and open conversation.",
      suffix: ""
    },
    audio: {
      title: "Audio seminar",
      text: "A separate room for talks and presentations. Keep your camera off.",
      suffix: "-seminar"
    }
  };

  // Hide the hero "Join the Community" button for members who are already logged in
  function syncJoinButton() {
    const join = document.getElementById("heroStartButton");
    if (join) join.style.display = loggedIn ? "none" : "";
  }

  let loggedIn = false;
  let roomCategory = null;
  let roomView = false;
  let openType = null;   // "video", "audio", or null

  function roomUrl(type) {
    return KMEET + roomCategory.slug + ROOM_TYPES[type].suffix;
  }

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
    openType = null;
  }

  function openRoom(type) {
    if (!roomCategory) return;
    roomBox.innerHTML = "";
    const frame = document.createElement("iframe");
    frame.src = roomUrl(type);
    frame.title = ROOM_TYPES[type].title + " for " + roomCategory.name;
    frame.allow = "camera; microphone; fullscreen; display-capture; autoplay";
    frame.style.cssText = "width:100%;height:70vh;min-height:420px;border:0;border-radius:12px;margin-top:14px;background:#000;";
    roomBox.appendChild(frame);
    openType = type;
    renderRooms();
  }

  function fullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    const request = roomBox.requestFullscreen || roomBox.webkitRequestFullscreen;
    if (request) request.call(roomBox).catch(() => {});
  }

  function renderRooms() {
    panel.style.display = roomView ? "block" : "none";
    if (!roomView) return;

    options.innerHTML = "";
    roomBox.innerHTML = roomBox.innerHTML; // keep any open frame

    if (!roomCategory) {
      info.textContent = "This category has no room yet.";
      return;
    }
    if (!loggedIn) {
      info.textContent = "Log in to join the rooms for " + roomCategory.name + ".";
      return;
    }

    info.textContent = openType
      ? "You are in the " + ROOM_TYPES[openType].title.toLowerCase() + " for " + roomCategory.name + "."
      : "Choose a room for " + roomCategory.name + ".";

    Object.keys(ROOM_TYPES).forEach(type => {
      const card = document.createElement("div");
      card.style.cssText = "border:1px solid #e2e8ef;border-radius:12px;padding:14px;background:#f8fafc;";

      const title = document.createElement("strong");
      title.textContent = ROOM_TYPES[type].title;
      title.style.cssText = "display:block;color:#102b46;margin-bottom:4px;";

      const text = document.createElement("p");
      text.textContent = ROOM_TYPES[type].text;
      text.style.cssText = "margin:0 0 10px;color:#64748b;font-size:14px;";

      card.append(title, text);

      if (openType === type) {
        card.append(
          makeButton("Full screen", fullScreen),
          makeButton("Leave room", () => { closeRoom(); renderRooms(); }, true)
        );
      } else if (openType) {
        const note = document.createElement("p");
        note.textContent = "Leave the open room first.";
        note.style.cssText = "margin:0;color:#64748b;font-size:13px;";
        card.appendChild(note);
      } else {
        card.appendChild(makeButton("Join", () => openRoom(type)));
      }

      options.appendChild(card);
    });
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

    if (parsed.view !== "category") {
      closeRoom();
      roomCategory = null;
      renderRooms();
    }

    if (parsed.view === "home") {
      window.scrollTo({ top: 0, behavior: "auto" });
      if (hash === "#about") {
        const about = document.getElementById("about");
        if (about) about.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (parsed.view === "categories" || parsed.view === "forum") {
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

    window.scrollTo({ top: 0, behavior: "auto" });
    try {
      const categories = await loadCategories();
      const found = categories.find(c => slugify(c.name) === parsed.slug) || null;
      roomCategory = found;
      if (found) selectCategoryCard(found.name);
    } catch (error) {
      console.error("pages.js: could not load categories", error);
      roomCategory = null;
      info.textContent = "The rooms could not load: " + (error.message || "unknown error");
    }
    renderRooms();
  }

  function navigate(path, hash) {
    const url = path + (hash === "#about" ? "#about" : "");
    if (location.pathname + location.hash !== url) history.pushState(null, "", url);
    route(path, hash);
  }

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

  db.auth.getSession().then(({ data }) => {
    loggedIn = !!data.session; syncJoinButton();
    renderRooms();
  });

  db.auth.onAuthStateChange((_event, session) => {
    loggedIn = !!session; syncJoinButton();
    if (!loggedIn) closeRoom();
    setTimeout(renderRooms, 0);
  });

  if (parse(location.pathname).unknown) {
    history.replaceState(null, "", "/");
  }
  route(location.pathname, location.hash);
})();