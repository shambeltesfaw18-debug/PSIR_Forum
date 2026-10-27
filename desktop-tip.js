(function () {
  "use strict";
  // Only on phones and small tablets, and only once per device unless it is shown again.
  if (window.innerWidth >= 800) return;
  try { if (localStorage.getItem("psirDesktopTipDismissed")) return; } catch (e) {}

  const amharic = (function () { try { return localStorage.getItem("psirLanguage") === "am"; } catch (e) { return false; } })();

  const tip = document.createElement("div");
  tip.id = "psirDesktopTip";
  tip.setAttribute("role", "status");
  tip.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:400;background:#102b46;color:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:14px;line-height:1.5;display:flex;gap:10px;align-items:flex-start;";

  const text = document.createElement("div");
  text.style.flex = "1";
  text.innerHTML = amharic
    ? "ለተሻለ እይታ የቅጾችንና የግምገማ ገጾችን ሰፊ እይታ ለማየት፣ የአሳሽ ምናሌውን (⋮) ይክፈቱና <strong>Desktop site</strong> ይምረጡ።"
    : "For a wider view of forms, review pages and paper details, open your browser menu (⋮) and tick <strong>Desktop site</strong>.";

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = amharic ? "እሺ" : "Got it";
  close.setAttribute("aria-label", amharic ? "ምክሩን ዝጋ" : "Dismiss tip");
  close.style.cssText = "border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;border-radius:999px;padding:5px 12px;font:inherit;font-weight:700;cursor:pointer;flex-shrink:0;";
  close.addEventListener("click", () => {
    try { localStorage.setItem("psirDesktopTipDismissed", "1"); } catch (e) {}
    tip.remove();
  });

  tip.append(text, close);
  document.body.appendChild(tip);
})();
