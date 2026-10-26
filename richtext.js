(function () {
  "use strict";

  // Stored rich posts start with this marker; older posts are plain text and stay plain.
  const MARK = "<!--rt1-->";

  // Only these tags survive cleaning. Everything else is removed or reduced to plain text.
  const KEEP = { P: 1, BR: 1, STRONG: 1, B: 1, EM: 1, I: 1, U: 1, H2: 1, H3: 1, UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, A: 1 };
  const DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, TEXTAREA: 1, INPUT: 1, BUTTON: 1, SELECT: 1, OPTION: 1, FORM: 1, IMG: 1, SVG: 1, MATH: 1, LINK: 1, META: 1 };

  function safeUrl(value) {
    try {
      const u = new URL(String(value || "").trim(), location.href);
      return (u.protocol === "http:" || u.protocol === "https:") ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  function clean(node) {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === 3) return;               // text is kept as text
      if (child.nodeType !== 1) { child.remove(); return; }

      const tag = child.tagName.toUpperCase();
      if (DROP[tag]) { child.remove(); return; }

      clean(child);

      if (tag === "A") {
        const href = safeUrl(child.getAttribute("href"));
        Array.from(child.attributes).forEach(a => child.removeAttribute(a.name));
        if (href) {
          child.setAttribute("href", href);
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer");
        } else {
          child.replaceWith(...child.childNodes);   // unsafe link: keep the words only
        }
        return;
      }

      if (!KEEP[tag]) {
        // Division and other blocks become paragraphs so line breaks survive
        if (tag === "DIV") {
          const p = document.createElement("p");
          while (child.firstChild) p.appendChild(child.firstChild);
          child.replaceWith(p);
        } else {
          child.replaceWith(...child.childNodes);
        }
        return;
      }

      Array.from(child.attributes).forEach(a => child.removeAttribute(a.name));
    });
  }

  function sanitize(html) {
    const doc = new DOMParser().parseFromString("<body>" + String(html || "") + "</body>", "text/html");
    clean(doc.body);
    return doc.body.innerHTML;
  }

  function escapeText(text) {
    return String(text || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  // What the page shows for a stored post
  function display(stored) {
    if (!stored) return "";
    if (stored.indexOf(MARK) === 0) {
      return '<div class="rt-content">' + sanitize(stored.slice(MARK.length)) + "</div>";
    }
    return '<div class="rt-content rt-plain">' + escapeText(stored) + "</div>";
  }

  function areaOf(el) {
    return el ? el.querySelector(".rt-area") : null;
  }

  // What gets saved: the cleaned HTML, or an empty string if nothing was written
  function encode(el) {
    const area = areaOf(el);
    if (!area) return "";
    if (!area.textContent.trim()) return "";
    return MARK + sanitize(area.innerHTML);
  }

  function clear(el) {
    const area = areaOf(el);
    if (area) area.innerHTML = "";
  }

  function run(area, command, value) {
    area.focus();
    document.execCommand(command, false, value);
  }

  function mount(el) {
    if (!el || el.dataset.rtMounted) return;
    el.dataset.rtMounted = "1";
    el.classList.add("rt-field");

    const toolbar = document.createElement("div");
    toolbar.className = "rt-toolbar";
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", "Text formatting");

    const area = document.createElement("div");
    area.className = "rt-area";
    area.contentEditable = "true";
    area.setAttribute("role", "textbox");
    area.setAttribute("aria-multiline", "true");
    area.setAttribute("data-placeholder", el.dataset.placeholder || "Write here…");

    const buttons = [
      ["B", "Bold", () => run(area, "bold")],
      ["I", "Italic", () => run(area, "italic")],
      ["U", "Underline", () => run(area, "underline")],
      ["H2", "Large heading", () => run(area, "formatBlock", "<h2>")],
      ["H3", "Small heading", () => run(area, "formatBlock", "<h3>")],
      ["•", "Bulleted list", () => run(area, "insertUnorderedList")],
      ["1.", "Numbered list", () => run(area, "insertOrderedList")],
      ["❝", "Block quote", () => run(area, "formatBlock", "<blockquote>")],
      ["🔗", "Link", () => {
        const url = safeUrl(prompt("Web address (must start with http:// or https://)", "https://"));
        if (!url) { alert("Only http and https links are allowed."); return; }
        run(area, "createLink", url);
      }]
    ];

    buttons.forEach(([label, name, action]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.title = name;
      b.setAttribute("aria-label", name);
      // Keep the text selection when a toolbar button is pressed
      b.addEventListener("mousedown", e => e.preventDefault());
      b.addEventListener("click", action);
      toolbar.appendChild(b);
    });

    // Paste as plain text only, so pasted web styles cannot enter the post
    area.addEventListener("paste", e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    });

    el.innerHTML = "";
    el.append(toolbar, area);
  }

  function scan() {
    document.querySelectorAll("[data-rt-mount]:not([data-rt-mounted])").forEach(mount);
  }

  new MutationObserver(scan).observe(document.body || document.documentElement, { childList: true, subtree: true });

  // Clear the new-discussion editor when its dialog closes
  const modal = document.getElementById("discussionModal");
  if (modal) {
    new MutationObserver(() => {
      if (modal.classList.contains("hidden")) clear(document.getElementById("postBody"));
    }).observe(modal, { attributes: true, attributeFilter: ["class"] });
  }

  const style = document.createElement("style");
  style.textContent = `
    .rt-field { border:1px solid #cfd9e4; border-radius:10px; background:#fff; overflow:hidden; }
    .rt-toolbar { display:flex; flex-wrap:wrap; gap:4px; padding:6px; border-bottom:1px solid #e7edf4; background:#f7f9fc; }
    .rt-toolbar button { border:1px solid #cfd9e4; background:#fff; border-radius:8px; padding:4px 9px; font:inherit; font-weight:700; color:#102b46; cursor:pointer; min-width:34px; }
    .rt-toolbar button:hover { background:#edf3f9; }
    .rt-toolbar button:focus-visible { outline:3px solid #e7b451; outline-offset:2px; }
    .rt-area { min-height:130px; padding:12px; outline:none; line-height:1.6; color:#172b3d; overflow-wrap:anywhere; white-space:pre-wrap; }
    .rt-reply .rt-area { min-height:64px; }
    .rt-area:empty:before { content:attr(data-placeholder); color:#8a97a6; }
    .rt-area:focus-visible { outline:3px solid #e7b451; outline-offset:-3px; }
    .rt-area h2, .rt-content h2 { font-size:1.15rem; margin:10px 0 6px; color:#102b46; }
    .rt-area h3, .rt-content h3 { font-size:1.02rem; margin:8px 0 4px; color:#102b46; }
    .rt-area blockquote, .rt-content blockquote { border-left:4px solid #e7b451; margin:8px 0; padding:4px 12px; color:#3c4f61; background:#fbf8ef; }
    .rt-area ul, .rt-area ol, .rt-content ul, .rt-content ol { padding-left:22px; margin:6px 0; }
    .rt-content { white-space:normal; overflow-wrap:anywhere; line-height:1.6; }
    .rt-content p { margin:0 0 8px; }
    .rt-content a { color:#2864a0; font-weight:600; }
    .rt-plain { white-space:pre-wrap; }
  `;
  document.head.appendChild(style);

  window.PSIRRich = { encode: encode, display: display, sanitize: sanitize, clear: clear, mount: mount };
  scan();
})();
