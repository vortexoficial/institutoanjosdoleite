/* ============================================================
   Servidor local só para conferir o site durante o trabalho.

   O site usa caminhos absolutos (/css/style.css), então abrir o
   arquivo direto no navegador não funciona: precisa de um
   servidor na raiz. Este aqui resolve, sem instalar nada.

   Uso: node servir.js  ->  http://localhost:5173

   Para testar o painel e as Functions, use o wrangler:
     npx wrangler pages dev dist
   ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");
const PORTA = Number(process.argv[2]) || 5173;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2"
};

http
  .createServer((req, res) => {
    let caminho = decodeURIComponent(req.url.split("?")[0]);
    if (caminho.endsWith("/")) caminho += "index.html";

    let alvo = path.join(DIST, caminho);

    // /contato -> /contato.html
    if (!fs.existsSync(alvo) && fs.existsSync(alvo + ".html")) alvo += ".html";

    if (!alvo.startsWith(DIST) || !fs.existsSync(alvo) || fs.statSync(alvo).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>404</h1><p>Arquivo não encontrado: " + caminho + "</p>");
    }

    res.writeHead(200, {
      "Content-Type": TIPOS[path.extname(alvo)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(alvo).pipe(res);
  })
  .listen(PORTA, () => {
    console.log(`Site em http://localhost:${PORTA}`);
    console.log("(este servidor é só para conferência local; não sobe nada)");
  });
