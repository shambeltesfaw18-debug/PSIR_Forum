// "Fill from link": reads a public page for its title, description and image, and imports a linked PDF.
(function () {
  "use strict";
  if (!window.supabase) return;
  const db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");

  async function token() {
    const { data } = await db.auth.getSession();
    if (!data.session) throw new Error("Please log in first.");
    return data.session.access_token;
  }
  async function details(url) {
    const r = await fetch("/api/course-preview", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + await token() },
      body: JSON.stringify({ url: url })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "Could not read this link. Please enter the details yourself.");
    return { title: d.title || "", description: d.description || "", image: d.image_url || "" };
  }
  async function pdfFile(url) {
    const r = await fetch("/api/document-fetch", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + await token() },
      body: JSON.stringify({ url: url })
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      throw new Error(d.error || "The PDF could not be imported. Please upload it yourself.");
    }
    const blob = await r.blob();
    const name = (new URL(url).pathname.split("/").pop() || "document").replace(/\.pdf$/i, "").replace(/[^A-Za-z0-9_-]+/g, "-").slice(0, 60) || "document";
    return new File([blob], name + ".pdf", { type: "application/pdf" });
  }
  function note(btn, text, bad) {
    const host = btn.parentElement;
    let m = host.querySelector(".lf-msg");
    if (!m) { m = document.createElement("p"); m.className = "lf-msg"; m.setAttribute("role", "status"); m.style.cssText = "width:100%;margin:6px 0 0;font-weight:600;"; host.appendChild(m); }
    m.textContent = text; m.style.color = bad ? "#B42318" : "#237A57";
  }
  function fillIfEmpty(el, value) { if (el && value && !el.value.trim()) el.value = value; }
  function descriptionField(key) {
    if (key === "auto") return document.querySelector("#formPanel textarea");
    return key ? document.getElementById(key) : null;
  }

  // News: the description goes into the Full text editor (that is what a news item saves).
  // It also goes into the Summary box, which journal and research items use.
  function fillDescription(key, text) {
    if (!text) return;
    if (key === "auto") {
      const area = document.querySelector("#nf_body .rt-area, #nf_body [contenteditable='true']");
      if (area && !area.textContent.trim()) {
        area.textContent = text;
        area.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const summary = document.getElementById("nf_summary");
      if (summary && !summary.value.trim()) summary.value = text;
      return;
    }
    fillIfEmpty(descriptionField(key), text);
  }

  document.addEventListener("click", async e => {
    const btn = e.target.closest("[data-lf]");
    if (!btn) return;
    e.preventDefault();
    const urlEl = document.getElementById(btn.dataset.lfUrl);
    const url = urlEl ? urlEl.value.trim() : "";
    if (!/^https:\/\//i.test(url)) return note(btn, "Please paste a link that starts with https://", true);
    btn.disabled = true;
    try {
      if (btn.dataset.lf === "fill") {
        const d = await details(url);
        fillIfEmpty(document.getElementById(btn.dataset.lfTitle), d.title);
        fillDescription(btn.dataset.lfDesc, d.description);
        if (btn.dataset.lfImage && d.image) { const img = document.getElementById(btn.dataset.lfImage); if (img && !img.value) img.value = d.image; }
        note(btn, d.description ? "Details filled in. Please check them before sending." : "The title was filled in. This page did not give a description, so please write one.");
      } else if (btn.dataset.lf === "pdf") {
        const file = await pdfFile(url);
        const dt = new DataTransfer();
        dt.items.add(file);
        document.getElementById(btn.dataset.lfFile).files = dt.files;
        note(btn, "PDF imported. Please check it, then send.");
      }
    } catch (err) {
      note(btn, err.message || "Something went wrong. Please try again.", true);
    } finally {
      btn.disabled = false;
    }
  });
})();
