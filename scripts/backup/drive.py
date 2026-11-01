#!/usr/bin/env python3
"""Upload, list, prune and download backups in one Google Drive folder. Standard library only."""
import json, os, sys, urllib.parse, urllib.request

TOKEN_URL = "https://oauth2.googleapis.com/token"
API = "https://www.googleapis.com/drive/v3/files"
UPLOAD = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
PREFIX = "daily-"


def token():
    body = urllib.parse.urlencode({
        "client_id": os.environ["GDRIVE_CLIENT_ID"],
        "client_secret": os.environ["GDRIVE_CLIENT_SECRET"],
        "refresh_token": os.environ["GDRIVE_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    with urllib.request.urlopen(urllib.request.Request(TOKEN_URL, data=body), timeout=60) as r:
        return json.load(r)["access_token"]


def call(method, url, tok, data=None, headers=None):
    h = {"Authorization": "Bearer " + tok}
    h.update(headers or {})
    return urllib.request.urlopen(urllib.request.Request(url, data=data, method=method, headers=h), timeout=900)


def backups(tok):
    folder = os.environ["GDRIVE_FOLDER_ID"]
    q = "'%s' in parents and trashed = false and name contains '%s'" % (folder, PREFIX)
    url = API + "?" + urllib.parse.urlencode({
        "q": q, "fields": "files(id,name,createdTime)", "pageSize": 1000, "orderBy": "createdTime desc"})
    return json.load(call("GET", url, tok))["files"]


def upload(path, name):
    tok = token()
    boundary = "psirbackup7f3a"
    meta = json.dumps({"name": name, "parents": [os.environ["GDRIVE_FOLDER_ID"]]}).encode()
    with open(path, "rb") as f:
        data = f.read()
    body = (
        f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n".encode() + meta +
        f"\r\n--{boundary}\r\nContent-Type: application/octet-stream\r\n\r\n".encode() + data +
        f"\r\n--{boundary}--\r\n".encode())
    r = call("POST", UPLOAD, tok, body, {"Content-Type": f"multipart/related; boundary={boundary}"})
    print("uploaded", json.load(r)["id"], name)


def prune(keep):
    tok = token()
    files = backups(tok)
    for f in files[keep:]:
        call("DELETE", API + "/" + f["id"], tok).close()
        print("deleted old backup", f["name"])
    print("kept", min(len(files), keep), "backups")


def latest(out):
    tok = token()
    files = backups(tok)
    if not files:
        sys.exit("no backups found in the folder")
    f = files[0]
    with call("GET", API + "/" + f["id"] + "?alt=media", tok) as r, open(out, "wb") as o:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            o.write(chunk)
    print("downloaded", f["name"])


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "upload":
        upload(sys.argv[2], sys.argv[3])
    elif cmd == "prune":
        prune(int(sys.argv[2]))
    elif cmd == "latest":
        latest(sys.argv[2])
    else:
        sys.exit("unknown command")
