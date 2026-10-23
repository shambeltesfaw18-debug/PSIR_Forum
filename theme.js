(function () {
  "use strict";

  const STORAGE_KEY = "psirTheme";

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
      --radius-card: 16px;
      --radius-pill: 999px;
      --radius-square: 6px;
    }

    [data-theme="dark"] {
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

    body {
      background: var(--bg) !important;
      color: var(--text) !important;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif !important;
      line-height: 1.6;
    }

    .section-white,
    .section {
      background: var(--bg) !important;
    }

    /* Cards: rounded and soft */
    .discussion-card,
    .category-card,
    .hub-category-card,
    .stat,
    .psir-files,
    .community-card {
      background: var(--surface) !important;
      color: var(--text) !important;
      border: 1px solid var(--line) !important;
      border-radius: var(--radius-card) !important;
    }

    /* Discussion cards: gold accent edge */
    .discussion-card {
      border-left: 4px solid var(--gold) !important;
    }

    /* Heading band for discussions */
    .section-heading:has(#discussionHeading) {
      background: var(--navy);
      color: #ffffff;
      border-radius: var(--radius-card);
      padding: 18px 20px;
      margin-bottom: 16px;
    }
    .section-heading:has(#discussionHeading) h2 {
      color: #ffffff;
      margin: 0;
    }
    .section-heading:has(#discussionHeading) p,
    .section-heading:has(#discussionHeading) span {
      color: #dfe5ee;
    }

    /* Text colors */
    h1, h2, h3, h4 { color: var(--text) !important; }
    p, li, label { color: var(--text); }
    .meta, .muted, small { color: var(--muted) !important; }

    /* Links use the second color */
    a { color: var(--link); }
    header a, nav a, .hero a, .btn-gold, .btn-accent { color: inherit; }

    /* Form fields: squarer, for a more serious feel */
    input, textarea, select {
      background: var(--surface) !important;
      color: var(--text) !important;
      border: 1px solid var(--line) !important;
      border-radius: var(--radius-square) !important;
      font-family: inherit;
    }
    input:focus-visible, textarea:focus-visible, select:focus-visible {
      outline: 3px solid var(--gold);
      outline-offset: 2px;
    }

    /* Buttons: pill-shaped primary actions */
    button:not(.category-card):not(.hub-category-card):not(.secondary):not(.danger):not(.ghost):not(.btn-gold),
    .btn:not(.secondary) {
      border-radius: var(--radius-pill) !important;
      background: linear-gradient(180deg, var(--navy-light) 0%, var(--navy) 60%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.45) !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18) !important;
      padding: 10px 18px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    button:not(.category-card):not(.hub-category-card):not(.secondary):not(.danger):not(.ghost):not(.btn-gold):hover,
    .btn:not(.secondary):hover {
      transform: translateY(-1px);
    }

    /* Gold call-to-action: pill */
    .btn-gold,
    .btn-accent {
      border-radius: var(--radius-pill) !important;
      background: linear-gradient(180deg, #e2bc4f 0%, var(--gold) 60%) !important;
      color: #1b2a41 !important;
      border: 1px solid rgba(255, 255, 255, 0.6) !important;
    }

    /* Secondary buttons: squarer */
    button.secondary,
    .btn-secondary,
    button.ghost {
      border-radius: var(--radius-square) !important;
      background: var(--surface) !important;
      color: var(--text) !important;
      border: 1px solid var(--line) !important;
      box-shadow: none !important;
    }

    /* Danger buttons: squarer and red */
    button.danger,
    .btn-danger {
      border-radius: var(--radius-square) !important;
      background: #a3172b !important;
      color: #ffffff !important;
      border: none !important;
    }

    /* Success messages use the second color */
    .ok,
    .msg.ok,
    #featureNotice[style*="#e6f4ea"] {
      color: var(--success) !important;
    }

    /* Focus ring */
    button:focus-visible,
    .btn:focus-visible,
    a:focus-visible {
      outline: 3px solid var(--gold);
      outline-offset: 2px;
    }

    /* Theme toggle */
    #psirThemeToggle {
      border-radius: var(--radius-pill);
      padding: 8px 14px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.5);
      background: transparent;
      color: #ffffff;
    }
    #psirThemeToggle.floating {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 50;
      background: var(--navy);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
    }

    @media (prefers-reduced-motion: reduce) {
      button, .btn { transition: none !important; }
    }
  `;

  const style = document.createElement("style");
  style.id = "psirTheme";
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- mode: saved choice, otherwise the phone's setting ----------
  function readSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveChoice(mode) {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) { /* storage blocked */ }
  }

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = readSaved() || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", initial);

  // ---------- toggle button ----------
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.id = "psirThemeToggle";

  function paintToggle() {
    const current = document.documentElement.getAttribute("data-theme");
    toggle.textContent = current === "dark" ? "Light mode" : "Dark mode";
    toggle.setAttribute("aria-label", current === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  toggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    saveChoice(next);
    paintToggle();
  });

  const host = document.getElementById("navLinks");
  if (host) {
    host.appendChild(toggle);
  } else {
    toggle.classList.add("floating");
    document.body.appendChild(toggle);
  }
  paintToggle();
})();