// Shows a small "Desktop site" tip on phones, on pages with wide content. Can be dismissed.
(function () {
  "use strict";
  var KEY = "psir-desktop-tip-dismissed";
  var path = window.location.pathname;
  var wanted = /^\/(discussions|research\.html|news\.html|career\.html|live\.html|live)$/.test(path);
  if (!wanted || window.innerWidth > 820) return;
  try { if (localStorage.getItem(KEY) === "1") return; } catch (e) {}
  var tip = document.createElement("div");
  tip.setAttribute("role", "note");
  tip.style.cssText = "margin:12px auto 0;width:min(1100px,calc(100% - 24px));background:#FFFFFF;border:1px solid #E6B75A;border-left:5px solid #E6B75A;border-radius:10px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;box-shadow:0 6px 18px rgba(10,30,70,.12);font-size:.92rem;line-height:1.45;color:#263238;";
  tip.innerHTML = '<div style="flex:1;"><strong style="color:#1E3F82;">Tip: best viewed as a desktop site.</strong> Open your browser menu (the three dots) and tap <strong>Desktop site</strong>. This page has wide content, such as forms, lists and the Live Room.</div>';
  var btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Got it";
  btn.style.cssText = "min-height:38px;padding:0 12px;border-radius:6px;border:1px solid #2855A6;background:#2855A6;color:#FFFFFF;font:inherit;font-weight:700;cursor:pointer;white-space:nowrap;";
  btn.addEventListener("click", function () {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    tip.remove();
  });
  tip.appendChild(btn);
  var header = document.querySelector("header.top, header.navbar");
  if (header && header.parentNode) header.parentNode.insertBefore(tip, header.nextSibling);
  else document.body.insertBefore(tip, document.body.firstChild);
})();
