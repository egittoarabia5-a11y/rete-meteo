const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {

  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  // ==========================================
  // FILE DA SERVIRE
  // ==========================================

  let filePath;

  // I file già presenti nella root
  if (
    urlPath.endsWith(".html") ||
    urlPath === "/"
  ) {
    filePath = path.join(
      __dirname,
      urlPath === "/" ? "index.html" : urlPath
    );
  }

  // Tutto il resto viene cercato in public
  else {
    filePath = path.join(
      __dirname,
      "public",
      urlPath
    );
  }

  // ==========================================
  // MIME TYPE
  // ==========================================

  const extname = path.extname(filePath).toLowerCase();

  let contentType = "application/octet-stream";

  if (extname === ".html") contentType = "text/html";
  if (extname === ".css") contentType = "text/css";
  if (extname === ".js") contentType = "text/javascript";
  if (extname === ".json") contentType = "application/json";
  if (extname === ".png") contentType = "image/png";
  if (extname === ".jpg") contentType = "image/jpeg";
  if (extname === ".jpeg") contentType = "image/jpeg";
  if (extname === ".svg") contentType = "image/svg+xml";
  if (extname === ".webp") contentType = "image/webp";

  // ==========================================
  // LETTURA FILE
  // ==========================================

  fs.readFile(filePath, (err, content) => {

    if (err) {
      res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
      });

      res.end("Pagina non trovata");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType
    });

    res.end(content);
  });

});

server.listen(3000, () => {
  console.log("Server su http://localhost:3000");
});