/* ============================================================
   Monta o sprite de ícones (src/parciais/icones.svg) a partir
   dos SVG baixados em ..\_icones-fonte.

   Ícones Lucide (traço) e de marca (preenchidos) recebem o
   tratamento certo. No HTML basta:
     <svg class="ic" aria-hidden="true"><use href="#i-heart"/></svg>

   Uso: node gerar-icones.js
   ============================================================ */

const fs = require("fs");
const path = require("path");

const ORIGEM = path.join(__dirname, "..", "_icones-fonte");
const DESTINO = path.join(__dirname, "src/parciais/icones.svg");

if (!fs.existsSync(ORIGEM)) {
  console.error("Pasta _icones-fonte não encontrada. Nada a fazer.");
  process.exit(0);
}

const simbolos = [];

fs.readdirSync(ORIGEM)
  .filter((f) => f.endsWith(".svg"))
  .sort()
  .forEach((arquivo) => {
    const bruto = fs.readFileSync(path.join(ORIGEM, arquivo), "utf8");
    const nome = arquivo.replace(/\.svg$/, "");
    const deMarca = nome.startsWith("marca-");

    const viewBox = (bruto.match(/viewBox="([^"]+)"/) || [, "0 0 24 24"])[1];

    let interno = bruto
      .replace(/<\?xml[\s\S]*?\?>/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<svg[\s\S]*?>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/<title>[\s\S]*?<\/title>/g, "")
      .trim();

    const atributos = deMarca
      ? 'fill="currentColor"'
      : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

    simbolos.push(
      `  <symbol id="i-${nome}" viewBox="${viewBox}" ${atributos}>\n    ${interno.replace(/\s+/g, " ")}\n  </symbol>`
    );
  });

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
${simbolos.join("\n")}
</svg>
`;

fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
fs.writeFileSync(DESTINO, sprite, "utf8");

console.log(`${simbolos.length} ícones no sprite (${Math.round(Buffer.byteLength(sprite) / 1024)} KB)`);
console.log("nomes: " + fs.readdirSync(ORIGEM).map((f) => "i-" + f.replace(".svg", "")).join(", "));
