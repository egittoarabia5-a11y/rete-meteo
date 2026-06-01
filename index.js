const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  let filePath = path.join(
    __dirname,
    req.url === "/public" ? "index.html" : req.url
  );

  const extname = path.extname(filePath);

  let contentType = "text/html";
  if (extname === ".css") contentType = "text/css";
  if (extname === ".js") contentType = "text/javascript";
  if (extname === ".png") contentType = "image/png";
  if (extname === ".jpg") contentType = "image/jpeg";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Pagina non trovata");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

server.listen(3000, () => {
  console.log("Server su http://localhost:3000");
});