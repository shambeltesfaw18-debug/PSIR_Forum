// Browser helper for ImageKit uploads. Checks the file, asks the server for permission, then uploads.
(function () {
  "use strict";
  const AUTH_PATH = "/api/imagekit-auth";
  const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
  const MAX_BYTES = 5 * 1024 * 1024;

  // Looks at the first bytes of the file, not just its name or declared type
  function sniff(head) {
    const b = head;
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return "image/jpeg";
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return "image/png";
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
    return null;
  }

  async function checkFile(file) {
    if (!file) throw new Error("Please choose an image.");
    if (file.size > MAX_BYTES) throw new Error("The image must be 5 MB or smaller.");
    const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const type = sniff(head);
    if (!type) throw new Error("Please choose a JPG, PNG or WebP image.");
    return type;
  }

  async function getPermission(token, purpose) {
    const r = await fetch(AUTH_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ purpose: purpose }),
      cache: "no-store"
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || "Could not prepare the upload. Please try again.");
    return data;
  }

  // Returns { url, fileId } on success. Calls onProgress(percent) while uploading.
  async function upload(file, opts) {
    await checkFile(file);
    const permission = await getPermission(opts.token, opts.purpose);

    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", "image");
      form.append("publicKey", permission.publicKey);
      form.append("signature", permission.signature);
      form.append("expire", String(permission.expire));
      form.append("token", permission.token);
      form.append("folder", permission.folder);
      form.append("useUniqueFileName", "true");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", UPLOAD_URL);
      xhr.upload.onprogress = e => {
        if (e.lengthComputable && opts.onProgress) opts.onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let body = {};
        try { body = JSON.parse(xhr.responseText); } catch (e) {}
        const ok = xhr.status >= 200 && xhr.status < 300 && typeof body.url === "string" &&
                   body.url.indexOf("https://ik.imagekit.io/") === 0;
        if (ok) resolve({ url: body.url, fileId: body.fileId || null });
        else reject(new Error("The image could not be uploaded. Please try again."));
      };
      xhr.onerror = () => reject(new Error("Network problem during upload. Check your connection and try again."));
      xhr.send(form);
    });
  }

  window.PSIRImageKit = { upload: upload, check: checkFile };
})();
