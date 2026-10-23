(function () {
  "use strict";

  const grid = document.querySelector("footer .footer-grid");
  if (!grid || document.getElementById("psirConnect")) return;

  const group = document.createElement("div");
  group.id = "psirConnect";

  const heading = document.createElement("h3");
  heading.textContent = "Connect";

  const links = document.createElement("div");
  links.className = "footer-links";

  const contacts = [
    ["Telegram", "https://t.me/psir_forumchannel", "Telegram channel (opens in a new tab)"],
    ["Facebook", "https://www.facebook.com/share/19ppJG3tkp/", "Facebook page (opens in a new tab)"],
    ["Email psirforum@gmail.com", "mailto:psirforum@gmail.com", "Send an email to PSIR Forum"]
  ];

  contacts.forEach(([label, href, description]) => {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    a.setAttribute("aria-label", description);
    if (href.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    links.appendChild(a);
  });

  group.append(heading, links);
  grid.appendChild(group);
})();
