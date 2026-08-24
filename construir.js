/* ============================================================
   Monta o site em dist/ a partir de src/.

   Por que existe: são 15 páginas com o mesmo cabeçalho, o mesmo
   rodapé e o mesmo cabeçalho de documento. Escrever isso 15 vezes
   é erro garantido. Aqui cada página cuida só do seu miolo.

   Como funciona:
     src/molde.html          esqueleto com {{marcadores}}
     src/parciais/*.html     topo, rodapé e sprite de ícones
     src/paginas/**.html     o miolo de cada página + bloco de dados
     src/css, src/js         estilo e scripts

   Uso:
     node construir.js              build de desenvolvimento
     node construir.js --producao   minifica e carimba versão no cache
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RAIZ = __dirname;
const SRC = path.join(RAIZ, "src");
const DIST = path.join(RAIZ, "dist");
const PRODUCAO = process.argv.includes("--producao");

const d = new Date();
const p = (n) => String(n).padStart(2, "0");
const VERSAO = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}`;

/* ---------- utilidades ---------- */

const ler = (f) => fs.readFileSync(f, "utf8");

function listarHtml(dir, base = "") {
  const saida = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, item.name);
    if (item.isDirectory()) saida.push(...listarHtml(path.join(dir, item.name), rel));
    else if (item.name.endsWith(".html")) saida.push(rel);
  }
  return saida;
}

function esbuild(entrada, saida, extra = []) {
  execFileSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["esbuild", entrada, "--minify", `--outfile=${saida}`, ...extra],
    { cwd: RAIZ, stdio: "pipe" }
  );
}

/* ---------- 1. dist limpa ---------- */

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

/* ---------- 2. parciais ---------- */

const parciais = {};
for (const arquivo of fs.readdirSync(path.join(SRC, "parciais"))) {
  const nome = arquivo.replace(/\.(html|svg)$/, "");
  parciais[nome] = ler(path.join(SRC, "parciais", arquivo)).trim();
}

const molde = ler(path.join(SRC, "molde.html"));

/* ---------- 3. páginas ---------- */

const paginas = listarHtml(path.join(SRC, "paginas"));
const gerado = [];

for (const rel of paginas) {
  const bruto = ler(path.join(SRC, "paginas", rel));

  // bloco de dados no topo do arquivo: <!--dados { ... } -->
  const bloco = bruto.match(/<!--dados\s*([\s\S]*?)-->/);
  let dados = { titulo: "Instituto Anjos do Leite", descricao: "", caminho: "/" };
  if (bloco) {
    try {
      dados = { ...dados, ...JSON.parse(bloco[1]) };
    } catch (e) {
      console.error(`ERRO: bloco de dados inválido em src/paginas/${rel}`);
      throw e;
    }
  } else {
    console.error(`AVISO: ${rel} não tem bloco de dados; usando título padrão.`);
  }

  const conteudo = bruto.replace(/<!--dados[\s\S]*?-->/, "").trim();

  let html = molde
    .replace("{{conteudo}}", conteudo)
    .replace(/\{\{(topo|rodape|icones)\}\}/g, (_, nome) => parciais[nome] || "")
    .replace(/\{\{(titulo|descricao|caminho)\}\}/g, (_, campo) => dados[campo] ?? "");

  // marca o item do menu da página atual
  const atual = "/" + rel.replace(/\\/g, "/");
  html = html.replace(
    new RegExp(`(<a[^>]*href="${atual.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}")`, "g"),
    '$1 aria-current="page"'
  );

  /* Carimbo de versão nos links de css e js.
     O _headers manda o navegador guardar esses arquivos por um ano,
     então o endereço precisa mudar a cada build. Em desenvolvimento
     o carimbo é o horário exato, senão a edição não aparece na tela. */
  const carimbo = PRODUCAO ? VERSAO : "dev" + Date.now();
  html = html.replace(
    /(href|src)="(\/(?:css|js|painel\/css|painel\/js)\/[^"?]+)"/g,
    (_, attr, arquivo) => `${attr}="${arquivo}?v=${carimbo}"`
  );

  /* Os espaços reservados de foto também levam carimbo: eles são
     regerados por script e o cache de um ano do _headers deixaria o
     desenho antigo na tela. Foto trocada pelo painel não passa por
     aqui, ela já vem com a própria versão na URL. */
  html = html.replace(
    /(src|srcset)="(\/assets\/img\/[^"?]+)"/g,
    (_, attr, arquivo) => `${attr}="${arquivo}?v=${carimbo}"`
  );

  const destino = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html, "utf8");
  gerado.push(rel);
}

/* ---------- 4. css e js ---------- */

fs.mkdirSync(path.join(DIST, "css"), { recursive: true });
fs.mkdirSync(path.join(DIST, "js/vendor"), { recursive: true });

if (PRODUCAO) {
  esbuild("src/css/style.css", "dist/css/style.css");
  for (const f of fs.readdirSync(path.join(SRC, "js"))) {
    if (f.endsWith(".js")) esbuild(`src/js/${f}`, `dist/js/${f}`);
  }
} else {
  fs.copyFileSync(path.join(SRC, "css/style.css"), path.join(DIST, "css/style.css"));
  for (const f of fs.readdirSync(path.join(SRC, "js"))) {
    if (f.endsWith(".js")) fs.copyFileSync(path.join(SRC, "js", f), path.join(DIST, "js", f));
  }
}

// o GSAP já vem minificado: sempre cópia direta
fs.cpSync(path.join(SRC, "js/vendor"), path.join(DIST, "js/vendor"), { recursive: true });

/* ---------- 5. assets, painel e arquivos de raiz ---------- */

fs.cpSync(path.join(RAIZ, "assets"), path.join(DIST, "assets"), { recursive: true });

if (fs.existsSync(path.join(RAIZ, "painel"))) {
  fs.cpSync(path.join(RAIZ, "painel"), path.join(DIST, "painel"), { recursive: true });

  // o HTML do painel também precisa do carimbo de versão
  const carimboPainel = PRODUCAO ? VERSAO : "dev" + Date.now();
  const paginaPainel = path.join(DIST, "painel/index.html");
  if (fs.existsSync(paginaPainel)) {
    const html = ler(paginaPainel).replace(
      /(href|src)="(\/painel\/(?:css|js)\/[^"?]+)"/g,
      (_, attr, arquivo) => `${attr}="${arquivo}?v=${carimboPainel}"`
    );
    fs.writeFileSync(paginaPainel, html, "utf8");
  }
}

for (const f of ["robots.txt", "_headers", "_redirects"]) {
  const origem = path.join(RAIZ, f);
  if (fs.existsSync(origem)) fs.copyFileSync(origem, path.join(DIST, f));
}

/* ---------- resumo ---------- */

const kb = (f) => (fs.existsSync(f) ? Math.round(fs.statSync(f).size / 1024) : 0);
console.log(`modo:    ${PRODUCAO ? "produção (minificado, versão " + VERSAO + ")" : "desenvolvimento"}`);
console.log(`páginas: ${gerado.length} (${gerado.join(", ")})`);
console.log(`css:     ${kb(path.join(DIST, "css/style.css"))} KB`);
console.log(`js:      ${kb(path.join(DIST, "js/main.js"))} KB + GSAP`);
