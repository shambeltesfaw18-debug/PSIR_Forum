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

    /* Page and sections */
    html body {
      background: var(--bg) !important;
      color: var(--text) !important;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif !important;
      line-height: 1.6;
    }
    html body .section-white,
    html body .section {
      background: var(--bg) !important;
    }

    /* Text */
    html body h1, html body h2, html body h3, html body h4 { color: var(--text) !important; }
    html body p, html body li, html body label { color: var(--text); }
    html body .meta, html body .muted, html body small { color: var(--muted) !important; }
    html body a { color: var(--link); }

    /* Cards: rounded */
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

    /* Form fields: squarer */
    html body input, html body textarea, html body select {
      background: var(--surface) !important;
      color: var(--text) !important;
      border: 1px solid var(--line) !important;
      border-radius: 6px !important;
    }

    /* Primary buttons: pill, navy gradient */
    html body button:not(.secondary):not(.ghost):not(.danger):not(.category-card):not(.hub-category-card):not(.psir-mode-btn):not(.btn-gold),
    html body .btn-primary {
      border-radius: 999px !important;
      background: linear-gradient(180deg, var(--navy-light) 0%, var(--navy) 60%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.45) !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18) !important;
      font-weight: 600;
    }

    /* Gold call-to-action: pill */
    html body .btn-gold {
      border-radius: 999px !important;
      background: linear-gradient(180deg, #e2bc4f 0%, var(--gold) 60%) !important;
      color: #1b2a41 !important;
      border: 1px solid rgba(255, 255, 255, 0.6) !important;
      font-weight: 600;
    }

    /* Outline buttons: squarer, light */
    html body .btn-outline,
    html body button.secondary,
    html body button.ghost {
      border-radius: 6px !important;
      background: var(--surface) !important;
      color: var(--text) !important;
      border: 1px solid var(--line) !important;
      box-shadow: none !important;
    }

    /* Danger: squarer, red */
    html body button.danger,
    html body .btn-danger {
      border-radius: 6px !important;
      background: #a3172b !important;
      color: #ffffff !important;
      border: none !important;
    }

    /* Success messages use the second color */
    html body .ok,
    html body .msg.ok { color: var(--success) !important; }

    /* Keyboard focus */
    html body button:focus-visible,
    html body .btn:focus-visible,
    html body a:focus-visible,
    html body input:focus-visible,
    html body textarea:focus-visible,
    html body select:focus-visible {
      outline: 3px solid var(--gold);
      outline-offset: 2px;
    }

    /* Appearance choice: Light / Dark / System */
    #psirThemeChoice {
      display: inline-flex;
      gap: 4px;
      padding: 3px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      margin-left: 8px;
    }
    #psirThemeChoice.floating {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 50;
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
      color: #ffffff !important;
      box-shadow: none !important;
    }
    html body #psirThemeChoice.floating .psir-mode-btn { color: var(--text) !important; }
    html body .psir-mode-btn[aria-pressed="true"] {
      background: #ffffff !important;
      color: #1b2a41 !important;
    }
    html body #psirThemeChoice.floating .psir-mode-btn[aria-pressed="true"] {
      background: var(--navy) !important;
      color: #ffffff !important;
    }

    @media (prefers-reduced-motion: reduce) {
      html body button, html body .btn { transition: none !important; }
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
    paintButtons();
  }

  // ---------- the three buttons ----------
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

  function paintButtons() {
    buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.value === choice)));
  }

  const host = document.getElementById("navLinks");
  if (host) {
    host.appendChild(group);
  } else {
    group.classList.add("floating");
    document.body.appendChild(group);
  }

  if (media && media.addEventListener) {
    media.addEventListener("change", () => { if (choice === "system") applyTheme(); });
  }

  applyTheme();
})();