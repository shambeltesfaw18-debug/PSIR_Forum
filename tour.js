// First-visit guide on the home page: points new visitors to Discussions, the Research Hub,
// News & Journal and Career. Shown once per browser; the visitor can dismiss it.
(function () {
  "use strict";
  const KEY = "psir-guide-seen-v1";
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }
  if (!document.body || document.getElementById("psir-guide")) return;

  const cards = [
    { title: "Discussions", text: "Ask questions and debate politics and international relations with members.", href: "/discussions", label: "Open discussions" },
    { title: "Research Hub", text: "Read and submit research papers. Each one is checked by a moderator before it appears.", href: "/research.html", label: "Open Research Hub" },
    { title: "News & Journal", text: "Current news with its source, plus analysis and essays from members.", href: "/news.html", label: "Open News & Journal" },
    { title: "Career", text: "Free courses, scholarships and jobs. Each one is checked before it is listed.", href: "/career.html", label: "Open Career" }
  ];

  const box = document.createElement("section");
  box.id = "psir-guide";
  box.setAttribute("aria-labelledby", "psir-guide-title");
  box.style.cssText = "margin:18px auto;width:min(1100px, calc(100% - 32px));background:#FFFFFF;border:1px solid #DCE3EE;border-left:5px solid #E6B75A;border-radius:10px;padding:18px;box-shadow:0 4px 14px rgba(16,43,70,0.06);";

  const head = document.createElement("div");
  head.style.cssText = "display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;";
  const title = document.createElement("h2");
  title.id = "psir-guide-title";
  title.textContent = "Welcome to PSIR Forum. Here is where to start.";
  title.style.cssText = "margin:0;font-size:1.15rem;color:#1E3F82;";
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "Got it";
  close.className = "psir-btn psir-navy";
  close.style.cssText = "min-height:38px;padding:0 14px;";
  head.append(title, close);
  box.appendChild(head);

  const grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px;margin-top:14px;";
  cards.forEach(c => {
    const card = document.createElement("div");
    card.style.cssText = "border:1px solid #E4EAF3;border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px;";
    const h = document.createElement("h3");
    h.textContent = c.title;
    h.style.cssText = "margin:0;font-size:1rem;color:#1E3F82;";
    const p = document.createElement("p");
    p.textContent = c.text;
    p.style.cssText = "margin:0;color:#475569;font-size:.9rem;line-height:1.5;";
    const a = document.createElement("a");
    a.href = c.href;
    a.textContent = c.label + " \u2192";
    a.style.cssText = "margin-top:auto;font-weight:700;color:#2855A6;text-decoration:none;";
    card.append(h, p, a);
    grid.appendChild(card);
  });
  box.appendChild(grid);

  const dismiss = () => {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    box.remove();
  };
  close.addEventListener("click", dismiss);

  const anchor = document.querySelector("header.top") || document.querySelector("header");
  if (anchor) anchor.insertAdjacentElement("afterend", box);
  else document.body.prepend(box);
})();
