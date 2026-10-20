(function () {
  "use strict";

  const css = `
    /* Discussion heading band (navy, as on the home page) */
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

    /* Discussion cards: gold edge */
    .discussion-card {
      border-left: 4px solid #c9a227;
    }

    /* Buttons: pill shape, glossy navy gradient, thin white border.
       Category cards are excluded so they keep their own look. */
    button:not(.category-card):not(.hub-category-card),
    .btn,
    input[type="submit"] {
      border-radius: 999px !important;
      background: linear-gradient(180deg, #34507a 0%, #1b2a41 55%, #15223a 100%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.55) !important;
      box-shadow: 0 2px 6px rgba(27, 42, 65, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.28) !important;
      padding: 10px 18px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    button:not(.category-card):not(.hub-category-card):hover,
    .btn:hover,
    input[type="submit"]:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(27, 42, 65, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
    }
    button:not(.category-card):not(.hub-category-card):disabled,
    .btn:disabled {
      opacity: 0.5;
      cursor: default;
      transform: none;
    }

    /* Gold for the main call-to-action buttons */
    .btn-gold,
    .btn-accent {
      background: linear-gradient(180deg, #e2bc4f 0%, #c9a227 55%, #b08d1f 100%) !important;
      color: #1b2a41 !important;
      border-color: rgba(255, 255, 255, 0.6) !important;
    }

    /* Light buttons for secondary actions */
    button.secondary,
    .btn-secondary,
    button.ghost {
      background: linear-gradient(180deg, #ffffff 0%, #eef1f6 100%) !important;
      color: #1b2a41 !important;
      border: 1px solid #c4cad3 !important;
      box-shadow: 0 1px 3px rgba(27, 42, 65, 0.12) !important;
    }

    /* Red for delete and remove actions */
    button.danger,
    .btn-danger {
      background: linear-gradient(180deg, #c4344a 0%, #a3172b 55%, #870f22 100%) !important;
      color: #ffffff !important;
    }

    /* Keyboard focus ring */
    button:focus-visible,
    .btn:focus-visible,
    a:focus-visible {
      outline: 3px solid #c9a227;
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      button, .btn { transition: none; }
      button:hover, .btn:hover { transform: none; }
    }
  `;

  const style = document.createElement("style");
  style.id = "psirTheme";
  style.textContent = css;
  document.head.appendChild(style);
})();