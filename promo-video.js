// Short PSIR Forum video (AI-generated), shown in a dismissible banner on the home page.
// The video is embedded from the public Telegram channel post. Closing it hides it for that browser.
(function () {
  "use strict";
  var KEY = "psir-promo-video-v1";
  var path = window.location.pathname;
  if (path !== "/" && path !== "/index.html") return;
  try { if (localStorage.getItem(KEY) === "1") return; } catch (e) {}

  var box = document.createElement("section");
  box.setAttribute("aria-label", "PSIR Forum short video");
  box.style.cssText = "width:min(960px,calc(100% - 24px));margin:14px auto;background:#FFFFFF;border:1px solid #E6B75A;border-radius:12px;padding:12px 14px;box-shadow:0 8px 22px rgba(10,30,70,.18);box-sizing:border-box;";

  var head = document.createElement("div");
  head.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;";
  head.innerHTML = '<strong style="color:#1E3F82;font-size:.95rem;">PSIR Forum short video <span style="color:#64748B;font-weight:600;">(AI-generated)</span></strong>';
  var close = document.createElement("button");
  close.type = "button";
  close.textContent = "Close";
  close.style.cssText = "min-height:36px;padding:0 12px;border-radius:6px;border:1px solid #2855A6;background:#FFFFFF;color:#2855A6;font:inherit;font-weight:700;cursor:pointer;";
  close.addEventListener("click", function () {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    box.remove();
  });
  head.appendChild(close);

  var slot = document.createElement("div");
  slot.style.cssText = "min-height:120px;";
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://telegram.org/js/telegram-widget.js?22";
  script.setAttribute("data-telegram-post", "psir_forumchannel/3");
  script.setAttribute("data-width", "100%");
  slot.appendChild(script);

  var foot = document.createElement("p");
  foot.style.cssText = "margin:8px 0 0;font-size:.9rem;";
  foot.innerHTML = '<a href="https://t.me/psir_forumchannel" target="_blank" rel="noopener noreferrer" style="color:#2855A6;font-weight:700;">Follow the PSIR Forum channel on Telegram</a>';

  box.appendChild(head);
  box.appendChild(slot);
  box.appendChild(foot);

  var header = document.querySelector("header.top, header.navbar");
  if (header && header.parentNode) header.parentNode.insertBefore(box, header.nextSibling);
  else document.body.insertBefore(box, document.body.firstChild);
})();
