(function () {
  "use strict";

  const THEME_KEY = "psirThemeChoice";   // same key the home page uses
  const LANG_KEY = "psirLanguage";

  const DICT = {
    "Home": "መነሻ", "Categories": "ምድቦች", "Discussions": "ውይይቶች",
    "Research Hub": "የምርምር ማዕከል", "News & Journal": "ዜና እና ጆርናል",
    "Submit Research": "ምርምር አስገባ", "Submit a news item": "የዜና ንጥል አስገባ",
    "Write for the Journal": "ለጆርናሉ ጻፍ", "Academic publishing policy": "የአካዳሚክ ማተሚያ ፖሊሲ",
    "Community Guidelines": "የማህበረሰብ መመሪያዎች", "Contact": "ያግኙን",
    "Save": "አስቀምጥ", "Saved": "ተቀምጧል", "Share": "አጋራ", "Read more →": "ተጨማሪ ያንብቡ →",
    "Read full paper (PDF)": "ሙሉ ወረቀት (PDF) ያንብቡ", "Open PDF": "PDF ክፈት",
    "Read, save and comment": "ያንብቡ፣ ያስቀምጡ እና አስተያየት ይስጡ",
    "Comments": "አስተያየቶች", "Post comment": "አስተያየት ላክ", "Edit": "አርም", "Delete": "ሰርዝ", "Withdraw": "ሰርዝና አቁም",
    "Abstract": "ማጠቃለያ", "Full text": "ሙሉ ጽሑፍ", "References": "ማጣቀሻዎች", "News": "ዜና", "Journal": "ጆርናል",
    "Latest news": "የቅርብ ጊዜ ዜናዎች", "Featured article": "ተመራጭ ጽሑፍ",
    "Recent journal articles and analysis": "የቅርብ ጊዜ የጆርናል ጽሑፎችና ትንታኔዎች",
    "Recent news": "የቅርብ ጊዜ ዜናዎች", "Search news and journal items": "የዜናና የጆርናል ንጥሎችን ይፈልጉ",
    "All items": "ሁሉም ንጥሎች", "News only": "ዜና ብቻ", "Journal only": "ጆርናል ብቻ",
    "Light": "ብርሃን", "Dark": "ጨለማ", "System": "ስርዓት",
    "Research & Academia Hub": "የምርምርና አካዳሚ ማዕከል",
    "Research Library": "የምርምር ቤተ-መጻሕፍት", "Search title, author, field, or keyword": "በርዕስ፣ በደራሲ፣ በመስክ ወይም በቁልፍ ቃል ይፈልጉ",
    "My submissions": "የእኔ ማስገቢያዎች", "Moderator review queue": "የአወያይ ግምገማ ወረፋ",
    "Moderator review queue: news and journal": "የአወያይ ግምገማ ወረፋ፡ ዜና እና ጆርናል",
    "Save draft": "ረቂቅ አስቀምጥ", "Submit for review": "ለግምገማ አስገባ", "Cancel": "ይቅር",
    "Preview": "ቅድመ-እይታ", "Log in": "ግባ", "Join forum": "መድረኩን ተቀላቀል",
    "Loading…": "በመጫን ላይ…", "Loading publication…": "ጽሑፉ በመጫን ላይ…",
    "Recently Published": "በቅርቡ የታተሙ", "Hub sections": "የማዕከሉ ክፍሎች",
    "Write for the Journal ": "ለጆርናሉ ጻፍ ",
    "Saved papers": "የተቀመጡ ጽሑፎች", "Remove": "አስወግድ", "Open": "ክፈት",
    "Saved": "ተቀምጧል"
  };
  const REVERSE = {};
  Object.keys(DICT).forEach(k => { REVERSE[DICT[k]] = k; });

  const CSS = `
    html[data-theme="dark"] body { background:#11161f !important; color:#e8edf5 !important; }
    html[data-theme="dark"] .top, html[data-theme="dark"] header.top { background:#1a2230 !important; border-color:#2c3748 !important; }
    html[data-theme="dark"] .top a, html[data-theme="dark"] .nav a, html[data-theme="dark"] .brand { color:#e8edf5 !important; }
    html[data-theme="dark"] .card, html[data-theme="dark"] .pub, html[data-theme="dark"] .item, html[data-theme="dark"] .panel,
    html[data-theme="dark"] .feature, html[data-theme="dark"] .empty, html[data-theme="dark"] .comment, html[data-theme="dark"] .thread,
    html[data-theme="dark"] .def, html[data-theme="dark"] .label, html[data-theme="dark"] .ghost-card {
      background:#1a2230 !important; color:#e8edf5 !important; border-color:#2c3748 !important;
    }
    html[data-theme="dark"] h1, html[data-theme="dark"] h2, html[data-theme="dark"] h3, html[data-theme="dark"] h4,
    html[data-theme="dark"] .card h3 a, html[data-theme="dark"] .pub h3, html[data-theme="dark"] .card strong, html[data-theme="dark"] .label strong { color:#e8edf5 !important; }
    html[data-theme="dark"] p, html[data-theme="dark"] li, html[data-theme="dark"] label, html[data-theme="dark"] .body,
    html[data-theme="dark"] .lead, html[data-theme="dark"] .abstract, html[data-theme="dark"] .refs, html[data-theme="dark"] .card p,
    html[data-theme="dark"] .pub p, html[data-theme="dark"] .feature p { color:#c9d3e0 !important; }
    html[data-theme="dark"] .meta, html[data-theme="dark"] .help, html[data-theme="dark"] small { color:#9aa8ba !important; }
    html[data-theme="dark"] a { color:#8cc8ff; }
    html[data-theme="dark"] input, html[data-theme="dark"] select, html[data-theme="dark"] textarea {
      background:#111826 !important; color:#e8edf5 !important; border-color:#34445c !important;
    }
    html[data-theme="dark"] .rt-field, html[data-theme="dark"] .rt-area { background:#111826 !important; color:#e8edf5 !important; }
    html[data-theme="dark"] .rt-toolbar { background:#1a2230 !important; }
    html[data-theme="dark"] .rt-toolbar button, html[data-theme="dark"] .btn-line, html[data-theme="dark"] .text-action,
    html[data-theme="dark"] .del { background:#1a2230 !important; color:#e8edf5 !important; border-color:#34445c !important; }
    html[data-theme="dark"] .pill { background:#24344d !important; color:#bcd4ee !important; }
    html[data-theme="dark"] .note { background:#2a2410 !important; color:#f0dca0 !important; border-color:#5a4a1a !important; }
    html[data-theme="dark"] .hero, html[data-theme="dark"] .section-heading { color:#e8edf5; }
    #psirAppearance { display:inline-flex; gap:4px; align-items:center; flex-wrap:wrap; margin-left:8px; }
    #psirAppearance button { border:1px solid #cfd9e4; background:#fff; color:#102b46; border-radius:999px; padding:5px 10px; font:inherit; font-size:13px; font-weight:700; cursor:pointer; }
    #psirAppearance button[aria-pressed="true"] { background:#102b46; color:#fff; border-color:#102b46; }
    #psirAppearance button:focus-visible { outline:3px solid #e7b451; outline-offset:2px; }
    html[data-theme="dark"] #psirAppearance button { background:#1a2230; color:#e8edf5; border-color:#34445c; }
    html[data-theme="dark"] #psirAppearance button[aria-pressed="true"] { background:#e8edf5; color:#11161f; }
    /* Button style: pills for main actions, rounded rectangles inside forms and lists */
    .hero .btn, .top .btn { border-radius:999px !important; }
    .panel .btn, .card .btn, .pub .btn, .item .btn, .feature .btn, .comment button, form .btn, .row-btns .btn,
    .actions .btn, #mine .btn, #queue .btn, .reply-form button, .del, .thumb-empty button, .text-action {
      border-radius:10px !important; padding:8px 14px; font-weight:650; box-shadow:0 1px 2px rgba(16,43,70,.12);
      transition:background .15s ease, color .15s ease, border-color .15s ease;
    }
    .panel .btn-small, .card .btn-small, .pub .btn-small, .item .btn-small, .row-btns .btn-small, .actions .btn-small { padding:6px 12px; font-size:.85rem; }
    .panel .btn:not(.btn-line):not(.btn-danger):not(.btn-gold):not(.del):hover:not(:disabled),
    .card .btn:not(.btn-line):not(.btn-danger):not(.btn-gold):hover:not(:disabled),
    .pub .btn:not(.btn-line):not(.btn-danger):not(.btn-gold):hover:not(:disabled),
    .item .btn:not(.btn-line):not(.btn-danger):not(.btn-gold):hover:not(:disabled),
    .row-btns .btn:not(.btn-line):not(.btn-danger):not(.btn-gold):hover:not(:disabled),
    .actions .btn:not(.btn-line):not(.btn-danger):not(.btn-gold):hover:not(:disabled),
    form .btn:not(.btn-line):not(.btn-danger):not(.btn-gold):hover:not(:disabled) { background:#0b2137 !important; }
    .panel .btn-line, .card .btn-line, .pub .btn-line, .item .btn-line, .row-btns .btn-line, .actions .btn-line, form .btn-line,
    .comment button:not(.danger), .text-action {
      background:#fff !important; color:#102b46 !important; border:1px solid #cfd9e4 !important;
    }
    .panel .btn-line:hover:not(:disabled), .card .btn-line:hover:not(:disabled), .actions .btn-line:hover:not(:disabled),
    .item .btn-line:hover:not(:disabled), .row-btns .btn-line:hover:not(:disabled), form .btn-line:hover:not(:disabled) { background:#f0f5fa !important; }
    .btn-danger, .del, .danger, [data-remove], [data-del], [data-review="delete"], [data-mine="delete"], [data-mine="withdraw"] {
      background:#fff !important; color:#8c2929 !important; border:1px solid #e7c2c7 !important;
    }
    .btn-danger:hover:not(:disabled), .del:hover:not(:disabled), [data-remove]:hover:not(:disabled), [data-del]:hover:not(:disabled) { background:#fdecea !important; }
    .hero .btn, .top .btn { border-radius:999px !important; }

  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  // ---------- theme ----------
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  let theme = "system";
  try { theme = localStorage.getItem(THEME_KEY) || "system"; } catch (e) {}

  function applyTheme() {
    const dark = theme === "dark" || (theme === "system" && media && media.matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    paint();
  }

  // ---------- language ----------
  let lang = "en";
  try { lang = localStorage.getItem(LANG_KEY) || "en"; } catch (e) {}
  const originals = new WeakMap();

  function translateNode(node, toAm) {
    const raw = node.nodeValue;
    const key = raw.trim();
    if (!key) return;
    if (toAm) {
      if (DICT[key] !== undefined) {
        if (!originals.has(node)) originals.set(node, raw);
        node.nodeValue = raw.replace(key, DICT[key]);
      }
    } else {
      const original = originals.get(node);
      if (original !== undefined && original.trim() === key) {
        node.nodeValue = original;
      } else if (REVERSE[key] !== undefined) {
        node.nodeValue = raw.replace(key, REVERSE[key]);
      }
    }
  }

  function walk(root, toAm) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && n.parentElement.closest("script,style,#psirAppearance")) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => translateNode(n, toAm));
  }

  function applyLanguage() {
    document.documentElement.lang = lang === "am" ? "am" : "en";
    walk(document.body, lang === "am");
    paint();
  }

  // ---------- controls ----------
  const host = document.querySelector(".top-inner") || document.querySelector(".top") || document.querySelector("header");
  const group = document.createElement("div");
  group.id = "psirAppearance";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Appearance and language");

  const themeButtons = [["light", "Light"], ["dark", "Dark"], ["system", "System"]].map(([value, label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.theme = value;
    b.textContent = label;
    b.addEventListener("click", () => {
      theme = value;
      try { localStorage.setItem(THEME_KEY, value); } catch (e) {}
      applyTheme();
    });
    group.appendChild(b);
    return b;
  });

  const langButton = document.createElement("button");
  langButton.type = "button";
  langButton.id = "psirLangButton";
  langButton.addEventListener("click", () => {
    lang = lang === "am" ? "en" : "am";
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyLanguage();
  });
  group.appendChild(langButton);

  function paint() {
    themeButtons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.theme === theme)));
    langButton.textContent = lang === "am" ? "English" : "አማርኛ";
    langButton.setAttribute("aria-label", lang === "am" ? "Switch to English" : "ወደ አማርኛ ቀይር");
  }

  if (host) host.appendChild(group);

  if (media && media.addEventListener) {
    media.addEventListener("change", () => { if (theme === "system") applyTheme(); });
  }

  // Translate content that appears after the first load (lists, dialogs)
  new MutationObserver(records => {
    if (lang !== "am") return;
    records.forEach(r => r.addedNodes.forEach(n => {
      if (n.nodeType === 3) translateNode(n, true);
      else if (n.nodeType === 1 && n.id !== "psirAppearance") walk(n, true);
    }));
  }).observe(document.body, { childList: true, subtree: true });

  applyTheme();
  applyLanguage();

  // ---------- Desktop-view tip for phone users (shown once, dismissible) ----------
  (function desktopTip() {
    const KEY = "psirDesktopTipDismissed";
    try { if (localStorage.getItem(KEY)) return; } catch (e) {}
    if (window.innerWidth >= 760) return;
    const bar = document.createElement("div");
    bar.id = "psirDesktopTip";
    bar.setAttribute("role", "status");
    bar.style.cssText = "position:fixed;left:10px;right:10px;bottom:10px;z-index:400;background:#102b46;color:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:14px;display:flex;gap:10px;align-items:flex-start;";
    bar.innerHTML = '<div style="flex:1;"><strong>Tip: for a wider view, use the desktop site.</strong>' +
      '<div style="opacity:.92;margin-top:3px;">In Chrome, tap the ⋮ menu (top right), then tick <em>Desktop site</em>. Papers, review queues and comments are easier to read on a larger screen.</div></div>' +
      '<button type="button" style="border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;border-radius:999px;padding:5px 11px;font:inherit;font-weight:700;cursor:pointer;white-space:nowrap;">Got it</button>';
    document.body.appendChild(bar);
    bar.querySelector("button").addEventListener("click", () => {
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
      bar.remove();
    });
  })();
})();
