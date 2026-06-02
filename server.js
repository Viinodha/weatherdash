/**
 * Minimal static file server for local development.
 * Run: node server.js
 * Open: http://localhost:3000
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const safePath = decodeURIComponent(req.url.split("?")[0]);
  const relativePath = safePath === "/" ? "/index.html" : safePath;
  const filePath = path.normalize(path.join(ROOT, relativePath));

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, err.code === "ENOENT" ? 404 : 500, err.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";
    send(res, 200, data, type);
  });
});

server.listen(PORT, () => {
  console.log(`Weather Dashboard running at http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop.");
});
