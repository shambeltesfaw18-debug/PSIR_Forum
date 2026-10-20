(function () {
  "use strict";

  const css = `
    .section-heading:has(#discussionHeading) {
      background: #1b2a41;
      color: #ffffff;
      border-radius: 16px;
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
    .discussion-card {
      border-left: 4px solid #c9a227;
    }
  `;

  const style = document.createElement("style");
  style.id = "psirTheme";
  style.textContent = css;
  document.head.appendChild(style);
})();