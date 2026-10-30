(function () {
  "use strict";
  if (!window.supabase) return;

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const PENDING = "psir-identity-pending";

  const IDENTITY_FIELDS = {
    "Student": ["institution", "department", "academic_level", "expected_graduation_year"],
    "Lecturer / Academic Staff": ["institution", "department", "position_title", "research_interests"],
    "Researcher": ["institution", "field_of_study", "specializations"],
    "Graduate": ["institution", "field_of_study", "graduation_year", "employment_status", "position_title", "employer"],
    "Other Professional": ["field_of_study", "position_title", "employer", "research_interests"],
    "Independent Scholar": ["field_of_study", "specializations", "research_interests"]
  };
  const LABELS = {
    institution: "Institution", department: "Department or field of study", academic_level: "Academic level",
    expected_graduation_year: "Expected graduation year (optional)", position_title: "Position or academic rank",
    research_interests: "Research interests", field_of_study: "Field of study or profession",
    graduation_year: "Graduation year", employment_status: "Employment status",
    employer: "Employer or organization (optional)", specializations: "Areas of specialization"
  };
  const OPTIONS = {
    academic_level: ["Undergraduate", "Master's", "Doctoral", "Other postgraduate"],
    employment_status: ["Employed", "Unemployed", "Self-employed", "Studying", "Other"]
  };
  const LONG = ["research_interests", "specializations"];
  const YEARS = ["expected_graduation_year", "graduation_year"];
  const IDENTITIES = Object.keys(IDENTITY_FIELDS);

  // ---------- 1. Identity choice on the sign-up form (index page) ----------
  const authForm = document.getElementById("authForm");
  const nameField = document.getElementById("authNameField");
  if (authForm && nameField) {
    const wrap = document.createElement("div");
    wrap.className = "form-field";
    wrap.id = "authIdentityField";
    wrap.innerHTML = '<label for="authIdentity">Your academic or professional identity</label>' +
      '<select class="field-select" id="authIdentity" style="width:100%;border:1px solid #dfe7ef;border-radius:10px;padding:12px 14px;">' +
      '<option value="">Choose one</option>' + IDENTITIES.map(i => '<option>' + i + '</option>').join("") +
      "</select>";
    nameField.insertAdjacentElement("afterend", wrap);
    const select = wrap.querySelector("select");

    function syncIdentity() {
      const registering = !nameField.classList.contains("hidden");
      wrap.classList.toggle("hidden", !registering);
      select.required = registering;
    }
    new MutationObserver(syncIdentity).observe(nameField, { attributes: true, attributeFilter: ["class"] });
    syncIdentity();

    authForm.addEventListener("submit", () => {
      if (!nameField.classList.contains("hidden") && select.value) {
        localStorage.setItem(PENDING, select.value);
      }
    }, true);
  }

  // ---------- 2. Create the academic record once the member is signed in ----------
  async function ensureRecord(user) {
    if (!user) return;
    const { data: existing } = await db.from("academic_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
    if (existing) { localStorage.removeItem(PENDING); return; }
    const identity = localStorage.getItem(PENDING) || (user.user_metadata && user.user_metadata.identity);
    if (!identity || !IDENTITIES.includes(identity)) return;
    const { error } = await db.from("academic_profiles").insert({ user_id: user.id, identity: identity, show_publicly: false });
    if (!error) localStorage.removeItem(PENDING);
  }

  // ---------- 3. Academic profile editor (profile page) ----------
  const box = document.getElementById("academicBox");
  if (!box) return;

  function field(key, value) {
    const wrap = document.createElement("div");
    wrap.style.marginTop = "10px";
    const label = document.createElement("label");
    label.htmlFor = "acad-" + key;
    label.textContent = LABELS[key];
    label.style.cssText = "display:block;font-size:14px;margin-bottom:4px;";
    let input;
    if (OPTIONS[key]) {
      input = document.createElement("select");
      input.innerHTML = '<option value="">Choose</option>' + OPTIONS[key].map(o => "<option>" + o + "</option>").join("");
      input.value = value || "";
    } else if (LONG.includes(key)) {
      input = document.createElement("textarea");
      input.rows = 3;
      input.maxLength = 500;
      input.value = value || "";
    } else {
      input = document.createElement("input");
      input.type = YEARS.includes(key) ? "number" : "text";
      if (YEARS.includes(key)) { input.min = key === "graduation_year" ? 1950 : 2000; input.max = 2100; }
      else input.maxLength = 150;
      input.value = value ?? "";
    }
    input.id = "acad-" + key;
    input.name = key;
    input.style.cssText = "width:100%;box-sizing:border-box;padding:10px;border:1px solid #e4e0d6;border-radius:6px;font:inherit;";
    wrap.append(label, input);
    return wrap;
  }

  function note(text, bad) {
    const p = document.createElement("p");
    p.textContent = text;
    p.style.cssText = "margin:8px 0 0;font-weight:600;color:" + (bad ? "#a3172b" : "#1b5e20") + ";";
    return p;
  }

  async function renderEditor() {
    const { data } = await db.auth.getSession();
    const user = data.session ? data.session.user : null;
    box.innerHTML = "";
    if (!user) return;

    const { data: row, error } = await db.from("academic_profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (error) { box.appendChild(note("Could not load your academic profile: " + error.message, true)); return; }

    const card = document.createElement("div");
    card.className = "card";
    card.style.cssText = "background:#fff;border:1px solid #e4e0d6;border-radius:16px;padding:16px;margin-bottom:12px;";
    const title = document.createElement("h2");
    title.textContent = "Academic profile";
    title.style.cssText = "font-size:18px;margin:0 0 6px;color:#102b46;";
    const intro = document.createElement("p");
    intro.textContent = "Optional. Institutions and positions are self-declared and are not verified. Your profile is private until you choose to show it.";
    intro.style.cssText = "margin:0 0 10px;color:#5b6573;font-size:14px;";
    card.append(title, intro);

    const form = document.createElement("form");
    const idLabel = document.createElement("label");
    idLabel.htmlFor = "acad-identity";
    idLabel.textContent = "I am a";
    idLabel.style.cssText = "display:block;font-size:14px;margin-bottom:4px;";
    const idSelect = document.createElement("select");
    idSelect.id = "acad-identity";
    idSelect.required = true;
    idSelect.style.cssText = "width:100%;box-sizing:border-box;padding:10px;border:1px solid #e4e0d6;border-radius:6px;font:inherit;";
    idSelect.innerHTML = '<option value="">Choose one</option>' + IDENTITIES.map(i => "<option>" + i + "</option>").join("");
    idSelect.value = row ? row.identity : "";
    form.append(idLabel, idSelect);

    const fieldsBox = document.createElement("div");
    form.appendChild(fieldsBox);

    function drawFields(identity, values) {
      fieldsBox.innerHTML = "";
      (IDENTITY_FIELDS[identity] || []).forEach(key => fieldsBox.appendChild(field(key, values ? values[key] : "")));
    }
    drawFields(idSelect.value, row);
    idSelect.addEventListener("change", () => drawFields(idSelect.value, null));

    const shareLabel = document.createElement("label");
    shareLabel.style.cssText = "display:flex;gap:8px;align-items:center;margin-top:14px;font-size:14px;";
    const share = document.createElement("input");
    share.type = "checkbox";
    share.id = "acad-share";
    share.checked = !!(row && row.show_publicly);
    shareLabel.append(share, document.createTextNode("Show my academic profile publicly (name, role, and the fields above)"));
    form.appendChild(shareLabel);

    const save = document.createElement("button");
    save.type = "submit";
    save.textContent = "Save academic profile";
    save.style.cssText = "margin-top:12px;padding:10px 18px;border:none;border-radius:999px;background:#102b46;color:#fff;font-weight:600;cursor:pointer;";
    form.appendChild(save);

    const status = document.createElement("div");
    form.appendChild(status);
    card.appendChild(form);

    const preview = document.createElement("div");
    preview.style.cssText = "margin-top:14px;";
    card.appendChild(preview);
    box.appendChild(card);

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (save.disabled) return;
      save.disabled = true;
      status.innerHTML = "";

      const identity = idSelect.value;
      const payload = {
        user_id: user.id,
        identity: identity,
        show_publicly: share.checked,
        updated_at: new Date().toISOString()
      };
      const allKeys = Object.keys(LABELS);
      allKeys.forEach(key => { payload[key] = null; });
      (IDENTITY_FIELDS[identity] || []).forEach(key => {
        const el = document.getElementById("acad-" + key);
        const raw = el ? el.value.trim() : "";
        if (YEARS.includes(key)) {
          payload[key] = raw === "" ? null : parseInt(raw, 10);
        } else {
          payload[key] = raw === "" ? null : raw;
        }
      });

      const badYear = YEARS.some(k => payload[k] !== null && (payload[k] < (k === "graduation_year" ? 1950 : 2000) || payload[k] > 2100));
      if (badYear) {
        status.appendChild(note("Please enter a valid year.", true));
        save.disabled = false;
        return;
      }

      const { error: saveError } = await db.from("academic_profiles").upsert(payload, { onConflict: "user_id" });
      save.disabled = false;
      if (saveError) {
        status.appendChild(note("Could not save: " + saveError.message, true));
        return;
      }
      status.appendChild(note("Academic profile saved.", false));
      renderPreview(user.id, preview);
    });

    renderPreview(user.id, preview);
  }

  // Shows exactly what other members can see, using the public view
  async function renderPreview(userId, target) {
    target.innerHTML = "";
    const { data, error } = await db.from("public_academic_profiles").select("*").eq("user_id", userId).maybeSingle();
    const heading = document.createElement("strong");
    heading.textContent = "What others can see";
    heading.style.cssText = "display:block;margin-bottom:6px;color:#102b46;";
    target.appendChild(heading);
    if (error) { target.appendChild(note("Could not load the public preview.", true)); return; }
    if (!data) {
      const p = document.createElement("p");
      p.textContent = "Nothing is shown publicly. Turn on the option above to share.";
      p.style.cssText = "margin:0;color:#5b6573;font-size:14px;";
      target.appendChild(p);
      return;
    }
    const list = document.createElement("div");
    list.style.cssText = "background:#f5f8fb;border-radius:10px;padding:12px;font-size:14px;";
    Object.keys(LABELS).forEach(key => {
      if (data[key] === null || data[key] === undefined || data[key] === "") return;
      const row = document.createElement("div");
      row.style.marginBottom = "6px";
      const k = document.createElement("strong");
      k.textContent = LABELS[key] + ": ";
      row.append(k, document.createTextNode(String(data[key])));
      list.appendChild(row);
    });
    const role = document.createElement("div");
    role.style.marginBottom = "6px";
    role.innerHTML = "<strong>Identity: </strong>";
    role.append(document.createTextNode(data.identity));
    list.prepend(role);
    target.appendChild(list);
  }

  db.auth.onAuthStateChange((_event, session) => {
    setTimeout(async () => {
      await ensureRecord(session ? session.user : null);
      renderEditor();
    }, 0);
  });
  db.auth.getSession().then(async ({ data }) => {
    await ensureRecord(data.session ? data.session.user : null);
    renderEditor();
  });

  // ---------- 4. Profile photo (optional, recommended) ----------
  const avatarBox = document.getElementById("avatarBox");
  async function renderAvatar() {
    if (!avatarBox) return;
    const { data: sess } = await db.auth.getSession();
    const user = sess.session ? sess.session.user : null;
    avatarBox.innerHTML = "";
    if (!user) return;
    const { data: me } = await db.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
    const hasPhoto = !!(me && me.avatar_url);

    const card = document.createElement("div");
    card.style.cssText = "background:#fff;border:1px solid #DCE3EE;border-radius:10px;padding:16px;margin-bottom:12px;";
    const title = document.createElement("h2");
    title.textContent = "Profile photo";
    title.style.cssText = "font-size:18px;margin:0 0 6px;color:#1E3F82;";
    const intro = document.createElement("p");
    intro.textContent = "Optional, but recommended: add a clear, professional photo of yourself. It is shown next to your name.";
    intro.style.cssText = "margin:0 0 10px;color:#64748B;font-size:14px;";
    const img = document.createElement("img");
    img.width = 96; img.height = 96;
    img.style.cssText = "width:96px;height:96px;border-radius:50%;object-fit:cover;border:1px solid #DCE3EE;display:block;margin-bottom:10px;background:#EAF0FC;";
    if (hasPhoto) { img.src = me.avatar_url; img.alt = "Your profile photo"; } else { img.alt = "No profile photo yet"; }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.setAttribute("aria-label", "Choose a profile photo");
    input.style.cssText = "margin-bottom:8px;";
    const save = document.createElement("button");
    save.type = "button";
    save.className = "btn btn-primary";
    save.textContent = "Upload photo";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-line";
    remove.textContent = "Remove photo";
    remove.style.marginLeft = "8px";
    remove.disabled = !hasPhoto;
    const msg = document.createElement("p");
    msg.setAttribute("role", "status");
    msg.style.cssText = "margin:8px 0 0;font-weight:600;";

    save.addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) { msg.style.color = "#B42318"; msg.textContent = "Please choose a photo first."; return; }
      save.disabled = true;
      msg.style.color = "#1E3F82";
      msg.textContent = "Uploading…";
      try {
        const token = sess.session.access_token;
        const up = await window.PSIRImageKit.upload(file, {
          purpose: "avatar", token: token,
          onProgress: p => { msg.textContent = "Uploading… " + p + "%"; }
        });
        const { error } = await db.from("profiles").update({ avatar_url: up.url }).eq("id", user.id);
        if (error) throw error;
        msg.style.color = "#237A57";
        msg.textContent = "Photo saved.";
        renderAvatar();
      } catch (e) {
        msg.style.color = "#B42318";
        msg.textContent = "Could not save the photo: " + (e.message || e);
        save.disabled = false;
      }
    });
    remove.addEventListener("click", async () => {
      const { error } = await db.from("profiles").update({ avatar_url: null }).eq("id", user.id);
      if (error) { msg.style.color = "#B42318"; msg.textContent = "Could not remove the photo: " + error.message; return; }
      msg.style.color = "#237A57";
      msg.textContent = "Photo removed.";
      renderAvatar();
    });

    card.append(title, intro, img, input, document.createElement("br"), save, remove, msg);
    avatarBox.appendChild(card);
  }

  renderAvatar();
  db.auth.onAuthStateChange(() => setTimeout(renderAvatar, 0));
})();
