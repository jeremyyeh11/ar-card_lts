// Dev-only static server with a file-save endpoint used by tools/compile.html.
// Run from the repo root:  node tools/dev-server.js  → http://localhost:8321
// NOT part of the deployed app.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 8321;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".mind": "application/octet-stream",
};

// Saving is restricted to these directories inside the repo.
const SAVE_DIRS = ["assets/targets", "assets/models"];

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url.startsWith("/save")) {
    const name = new URL(req.url, "http://x").searchParams.get("name") || "";
    const rel = name.replace(/\\/g, "/");
    const target = path.resolve(ROOT, rel);
    const allowed = SAVE_DIRS.some((d) =>
      target.startsWith(path.resolve(ROOT, d) + path.sep)
    );
    if (!allowed || rel.includes("..")) {
      res.writeHead(400);
      return res.end("save path not allowed");
    }
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, Buffer.concat(chunks));
      console.log("saved", rel, Buffer.concat(chunks).length, "bytes");
      res.writeHead(200);
      res.end("ok");
    });
    return;
  }

  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const file = path.resolve(ROOT, "." + urlPath);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    return res.end("not found");
  }
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`dev server running at http://localhost:${PORT}`);
});
