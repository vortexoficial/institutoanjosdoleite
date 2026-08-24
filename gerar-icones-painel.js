/* ============================================================
   Monta o sprite de ícones do painel e injeta no painel/index.html,
   entre os marcadores <!--icones--> e <!--/icones-->.

   O painel não passa pelo molde do site, então o sprite vive dentro
   do próprio HTML dele. Inline de propósito: uma requisição a menos
   e nada de <use> apontando para arquivo externo.

   Uso: node gerar-icones-painel.js
   ============================================================ */

const fs = require("fs");
const path = require("path");

const ORIGEM = path.join(__dirname, "..", "_icones-painel");
const PAGINA = path.join(__dirname, "painel/index.html");

if (!fs.existsSync(ORIGEM)) {
  console.error("Pasta _icones-painel não encontrada. Nada a fazer.");
  process.exit(0);
}

const simbolos = fs
  .readdirSync(ORIGEM)
  .filter((f) => f.endsWith(".svg"))
  .sort()
  .map((arquivo) => {
    const bruto = fs.readFileSync(path.join(ORIGEM, arquivo), "utf8");
    const nome = arquivo.replace(/\.svg$/, "");
    const viewBox = (bruto.match(/viewBox="([^"]+)"/) || [, "0 0 24 24"])[1];
    const interno = bruto
      .replace(/<\?xml[\s\S]*?\?>/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<svg[\s\S]*?>/, "")
      .replace(/<\/svg>\s*$/, "")
      .trim()
      .replace(/\s+/g, " ");

    return `  <symbol id="p-${nome}" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n    ${interno}\n  </symbol>`;
  });

const sprite =
  `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n` +
  simbolos.join("\n") +
  `\n</svg>`;

let html = fs.readFileSync(PAGINA, "utf8");

if (!html.includes("<!--icones-->")) {
  console.error("Marcadores <!--icones--> não encontrados em painel/index.html.");
  process.exit(1);
}

html = html.replace(
  /<!--icones-->[\s\S]*?<!--\/icones-->/,
  `<!--icones-->\n${sprite}\n<!--/icones-->`
);

fs.writeFileSync(PAGINA, html, "utf8");

console.log(`${simbolos.length} ícones no sprite do painel`);
console.log("nomes: " + simbolos.map((s) => s.match(/id="([^"]+)"/)[1]).join(", "));
