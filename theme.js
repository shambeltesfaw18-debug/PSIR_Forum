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

    /* Gold call-to-action */
    html body .btn-gold {
      border-radius: 999px !important;
      background: linear-gradient(180deg, #e2bc4f 0%, var(--gold) 60%) !important;
      color: #1b2a41 !important;
      border: 1px solid rgba(255, 255, 255, 0.6) !important;
      font-weight: 600;
    }

    /* Outline and secondary buttons: squarer, light */
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

    /* Success messages */
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
      html body button, html body .btn { transition: none !important; }
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
        linear-gradient(120deg, rgba(16, 43, 70, 0.92), rgba(24, 62, 96, 0.86)),
        url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=70") center / cover no-repeat !important;
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

  // Category card icons: simple line drawings in the brand blue (the Hub logo is not changed)
  const CATEGORY_ICONS = {
    "International Relations": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>',
    "Political Science": '<path d="M2 9l10-5 10 5M3 20h18M5 9v9M9.5 9v9M14.5 9v9M19 9v9"/>',
    "Diplomacy & Foreign Policy": '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c0-3 2-5 5-5s5 2 5 5M11 20c0-3 2-5 5-5s5 2 5 5"/>',
    "Research & Academia": '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7M8 11h7"/>',
    "Peace & Security": '<path d="M12 21V8"/><path d="M12 10c-3 0-5-2-5-5 3 0 5 2 5 5zM12 14c3 0 5-2 5-5-3 0-5 2-5 5z"/>',
    "Governance & Public Policy": '<path d="M3 9l9-5 9 5M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18"/>',
    "African Affairs": '<path d="M8 3l4 1 3 3 2 4-1 3 2 2-2 4-3 3-3 1-2-3-1-4-2-3 1-3-1-4z"/>',
    "General Discussion": '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'
  };

  document.querySelectorAll(".category-card[data-category]").forEach(card => {
    const paths = CATEGORY_ICONS[card.dataset.category];
    const slot = card.querySelector(".category-emoji");
    if (!paths || !slot) return;
    slot.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
    slot.style.color = "#2864a0";
  });
})();