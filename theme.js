(function () {
  "use strict";

  const STORAGE_KEY = "psirThemeChoice"; // "light", "dark", or "system"

  const css = `
    :root {
      --bg: #f7f5f0;
      --surface: #ffffff;
      --text: #1b2a41;
      --muted: #5b6573;
      --line: #e4e0d6;
      --navy: #1b2a41;
      --navy-light: #34507a;
      --gold: #c9a227;
      --link: #1f6f78;
      --success: #2e7d4f;
    }

    html[data-theme="dark"] {
      --bg: #11161f;
      --surface: #1a2230;
      --text: #e8edf5;
      --muted: #a7b1c2;
      --line: #2c3748;
      --navy: #2a3f63;
      --navy-light: #3d5a8a;
      --link: #7fd0d8;
      --success: #6fd39a;
    }

    /* Page and header */
    html body {
      background: var(--bg) !important;
      color: var(--text) !important;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif !important;
      line-height: 1.6;
    }
    html body header {
      background: var(--surface) !important;
      color: var(--text) !important;
      border-bottom: 1px solid var(--line);
    }
    html body header a, html body header .brand-name { color: var(--text) !important; }
    html body .section-white,
    html body .section { background: var(--bg) !important; }

    /* Text */
    html body h1, html body h2, html body h3, html body h4 { color: var(--text) !important; }
    html body p, html body li, html body label { color: var(--text); }
    html body .meta, html body .muted, html body small { color: var(--muted) !important; }
    html body a { color: var(--link); }

    /* Cards */
    html body .discussion-card,
    html body .category-card,
    html body .hub-category-card,
    html body .stat,
    html body .psir-files,
    html body .community-card {
      background: var(--surface) !important;
      color: var(--text) !important;
      border: 1px solid var(--line) !important;
      border-radius: 16px !important;
    }
    html body .discussion-card { border-left: 4px solid var(--gold) !important; }

    /* Category titles: readable in both modes */
    html body .category-card h3,
    html body .category-card h4,
    html body .category-card strong,
    html body .hub-category-card h3,
    html body .hub-category-card h4,
    html body .hub-category-card strong {
      color: var(--text) !important;
    }

    /* Discussion heading band */
    html body .section-heading:has(#discussionHeading) {
      background: var(--navy) !important;
      border-radius: 16px !important;
      padding: 18px 20px;
      margin-bottom: 16px;
    }
    html body .section-heading:has(#discussionHeading) h2,
    html body .section-heading:has(#discussionHeading) h3 { color: #ffffff !important; margin: 0; }
    html body .section-heading:has(#discussionHeading) p,
    html body .section-heading:has(#discussionHeading) span { color: #dfe5ee !important; }

    /* Form fields */
    html body input, html body textarea, html body select {
      background: var(--surface) !important;
      color: var(--text) !important;
      border: 1px solid var(--line) !important;
      border-radius: 6px !important;
    }

    /* Success messages */
    html body .ok,
    html body .msg.ok { color: var(--success) !important; }

    /* Appearance choice: always visible at the bottom-right */
    #psirThemeChoice {
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 60;
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      border-radius: 999px;
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    html body .psir-mode-btn {
      border-radius: 999px !important;
      padding: 6px 12px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      border: none !important;
      cursor: pointer;
      background: transparent !important;
      color: var(--text) !important;
      box-shadow: none !important;
    }
    html body .psir-mode-btn[aria-pressed="true"] {
      background: var(--navy) !important;
      color: #ffffff !important;
    }

    @media (prefers-reduced-motion: reduce) {
    }
    /* Hero text stays readable on the navy background in every mode */
    html body .hero h1 { color: #ffffff !important; }
    html body .hero h1 span { color: #e7b451 !important; }
    html body .hero h2, html body .hero strong, html body .hero-topic strong { color: #ffffff !important; }
    html body .hero .eyebrow { color: #e7b451 !important; }
    html body .hero p, html body .hero .hero-copy { color: #d6e2ee !important; }
    html body .hero-card p, html body .hero-topic small { color: #c8d8e7 !important; }

    /* Hero background: world image with a navy overlay so the text stays readable */
    html body .hero {
      background:
        linear-gradient(120deg, rgba(16, 43, 70, 0.55), rgba(24, 62, 96, 0.45)),
        url("/images/world_map_hero.jpg") center / cover no-repeat !important;
    }

    /* Hero text shadow keeps the text readable over the lighter image */
    html body .hero h1, html body .hero p, html body .hero .eyebrow {
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
    }

    

    /* Keep the header, login buttons and bell inside the screen width (desktop-site and small screens) */
    html body { max-width:100% !important; overflow-x:hidden !important; }
    html body #navActions, html body .nav-actions { flex-wrap:wrap !important; justify-content:flex-end !important; max-width:100% !important; row-gap:6px; }
    html body #psirBell { flex:0 0 auto !important; }
    html body header, html body .topbar, html body .site-header { max-width:100% !important; }

    /* Category cards: lift, scale and gold accent on hover (Tailwind-style: hover:-translate-y-1, transition-all duration-300) */
    html body .category-card {
      transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
      will-change: transform;
    }
    html body .category-card:hover, html body .category-card:focus-visible {
      transform: translateY(-4px) scale(1.01);
      border-color: rgba(231, 180, 81, .75) !important;
      box-shadow: 0 14px 30px rgba(2, 6, 23, .35), 0 0 0 1px rgba(231, 180, 81, .55), 0 0 22px rgba(231, 180, 81, .25);
    }
    html body .category-card:focus-visible { outline: 3px solid #e7b451; outline-offset: 3px; }
    @media (prefers-reduced-motion: reduce) {
      html body .category-card, html body .category-card:hover { transition: none !important; transform: none !important; }
    }

    html body .category-card strong, html body .category-card p, html body .category-card .explore-link { color:#ffffff !important; text-shadow:0 1px 8px rgba(2, 6, 23, .7) !important; }

    /* Category cards: lift and gold accent on hover (the bottom overlay keeps the text readable) */
    html body .category-card { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
    html body .category-card:hover, html body .category-card:focus-visible {
      transform: translateY(-4px) scale(1.01);
      border-color: rgba(231, 180, 81, .75) !important;
      box-shadow: 0 0 0 1px rgba(231, 180, 81, .45), 0 14px 30px rgba(16, 43, 70, .28);
    }
    html body .category-card:focus-visible { outline: 3px solid #e7b451; outline-offset: 3px; }
    @media (prefers-reduced-motion: reduce) {
      html body .category-card, html body .category-card:hover { transition: none !important; transform: none !important; }
    }

    /* Collapse the menu into the ☰ button on wide phones, tablets and desktop-site mode (screens up to 1180px) */
    @media (max-width: 1180px) {
      html body .nav-inner { flex-wrap: wrap; padding: 12px 0; }
      html body .mobile-menu { display: inline-flex !important; }
      html body .nav-links {
        display: none !important; order: 4; width: 100%; flex-direction: column; align-items: stretch;
        gap: 0; background: #fff; border-top: 1px solid var(--border); padding: 4px 0;
      }
      html body .nav-links.open { display: flex !important; }
      html body .nav-links a { padding: 12px 4px; border-bottom: 1px solid #edf0f4; font-size: 0.95rem; }
      html body .nav-actions { margin-left: auto; }
    }

    /* Keep the Light / Dark / System selector from covering content */
    @media (max-width: 800px) {
      html body { padding-bottom: 76px !important; }
      #psirThemeChoice { right: 8px !important; bottom: 8px !important; transform: scale(0.92); transform-origin: right bottom; }
    }
    @media (min-width: 801px) {
      #psirThemeChoice { bottom: 16px !important; right: 16px !important; }
    }

  `;

  const style = document.createElement("style");
  style.id = "psirTheme";
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- choice: light, dark, or system ----------
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function readChoice() {
    try { return localStorage.getItem(STORAGE_KEY) || "system"; } catch (e) { return "system"; }
  }
  function saveChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked */ }
  }

  let choice = readChoice();

  function applyTheme() {
    const dark = choice === "dark" || (choice === "system" && media && media.matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.value === choice)));
  }

  const group = document.createElement("div");
  group.id = "psirThemeChoice";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Appearance");

  const options = [["light", "Light"], ["dark", "Dark"], ["system", "System"]];
  const buttons = options.map(([value, label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "psir-mode-btn";
    b.textContent = label;
    b.dataset.value = value;
    b.addEventListener("click", () => {
      choice = value;
      saveChoice(value);
      applyTheme();
    });
    group.appendChild(b);
    return b;
  });

  document.body.appendChild(group);

  if (media && media.addEventListener) {
    media.addEventListener("change", () => { if (choice === "system") applyTheme(); });
  }

  applyTheme();

  // Category cards: picture as the card background with a navy overlay for readable white text
  const CATEGORY_IMAGES = {
    "International Relations": "/images/international-relations.jpg",
    "Political Science": "/images/political-science.jpg",
    "Diplomacy & Foreign Policy": "/images/diplomacy-foreign-policy.jpg",
    "Research & Academia": "/images/research-academia.jpg",
    "Peace & Security": "/images/peace-security.jpg",
    "Governance & Public Policy": "/images/governance-public-policy.jpg?v=2",
    "African Affairs": "/images/african-affairs.jpg",
    "General Discussion": "/images/general-discussion.jpg",
    "Hub of Idea Discussion Club": "/hub-of-idea-logo.png",
    "Ethiopian Politics & Affairs": "/images/ethiopia-politics.jpg"
  };

  // Card icons that replace the emoji
  const CATEGORY_ICONS = {
    "Ethiopian Politics & Affairs": "/images/ethiopia-icon.jpg"
  };

  document.querySelectorAll(".category-card[data-category]").forEach(card => {
    const src = CATEGORY_IMAGES[card.dataset.category];
    if (!src) return;

    // Hide the small icon, since the picture now fills the card
    const slot = card.querySelector(".category-emoji");
    const icon = CATEGORY_ICONS[card.dataset.category];
    if (slot && icon) {
      slot.innerHTML = "";
      const img = document.createElement("img");
      img.src = icon;
      img.alt = "";
      img.width = 44;
      img.height = 44;
      img.style.cssText = "width:44px;height:44px;object-fit:cover;border-radius:10px;display:block;";
      slot.appendChild(img);
    }
    if (slot) {
      slot.style.display = "grid";
      slot.style.placeItems = "center";
      slot.style.width = "44px";
      slot.style.height = "44px";
      slot.style.borderRadius = "12px";
      slot.style.background = "rgba(255, 255, 255, 0.18)";
      slot.style.border = "1px solid rgba(255, 255, 255, 0.28)";
      slot.style.fontSize = "1.4rem";
      slot.style.marginBottom = "12px";
      slot.style.setProperty("color", "#ffffff", "important");
    }

    card.style.setProperty(
      "background-image",
      "linear-gradient(to top, rgba(2, 6, 23, 0.92) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(2, 6, 23, 0) 100%), url('" + src + "')",
      "important"
    );
    card.style.setProperty("background-size", "cover", "important");
    card.style.setProperty("background-position", "center", "important");
    card.style.setProperty("background-color", "#102b46", "important");
    card.style.minHeight = "230px";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.justifyContent = "flex-end";
    card.style.overflow = "hidden";

    card.querySelectorAll("strong, p, .explore-link").forEach(el => {
      el.style.setProperty("color", "#ffffff", "important");
      el.style.setProperty("text-shadow", "0 1px 8px rgba(0, 0, 0, 0.5)", "important");
    });
  });

  // Category page: show the category picture as a banner behind the heading
  function applyCategoryBanner() {
    const heading = document.getElementById("discussionHeading");
    if (!heading) return;
    const band = heading.closest(".section-heading");
    if (!band) return;

    const src = CATEGORY_IMAGES[heading.textContent.trim()];
    if (src) {
      band.style.setProperty(
        "background-image",
        "linear-gradient(120deg, rgba(16, 43, 70, 0.82), rgba(16, 43, 70, 0.55)), url('" + src + "')",
        "important"
      );
      band.style.setProperty("background-size", "cover", "important");
      band.style.setProperty("background-position", "center", "important");
      band.style.setProperty("min-height", "150px", "important");
      band.style.setProperty("align-items", "flex-end", "important");
    } else {
      band.style.removeProperty("background-image");
      band.style.removeProperty("background-size");
      band.style.removeProperty("background-position");
      band.style.removeProperty("min-height");
      band.style.removeProperty("align-items");
    }
  }

  const headingWatch = document.getElementById("discussionHeading");
  if (headingWatch) {
    new MutationObserver(applyCategoryBanner).observe(headingWatch, { childList: true, characterData: true, subtree: true });
  }
  applyCategoryBanner();

})();