/* ============================================================
   Ferramenta de verificação de responsividade.

   Gera dist/_verificacao.html, uma página que carrega o site em
   telas de 320 a 1440 px e confere, sem depender do olho:

     1. rolagem lateral (scrollWidth maior que a tela)
     2. elementos que passam da borda
     3. texto cortado (altura real maior que a visível)
     4. alvos de toque menores que 44 px

   Uso:
     node construir.js && node verificar.js && node servir.js
     abrir http://localhost:5173/_verificacao.html

   A página roda sozinha e mostra o resultado. Nenhum arquivo do
   site é alterado: o testador vive só na dist.
   ============================================================ */

const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");
const LARGURAS = [320, 360, 390, 414, 768, 1024, 1280, 1440];

const PAGINA = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Verificação de responsividade</title>
<style>
  body { font: 15px/1.6 system-ui, sans-serif; margin: 0; padding: 24px; background: #faf7fd; color: #2b2331; }
  h1 { font-size: 1.4rem; margin: 0 0 4px; }
  .sub { color: #5f5768; margin-bottom: 24px; }
  table { border-collapse: collapse; width: 100%; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
  th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #ece7f1; font-size: 14px; }
  th { background: #6a239a; color: #fff; font-size: 13px; letter-spacing: .04em; text-transform: uppercase; }
  .ok { color: #0a7d3f; font-weight: 700; }
  .falha { color: #b3261e; font-weight: 700; }
  .detalhe { font-size: 12px; color: #857d8e; }
  iframe { border: 0; position: absolute; left: -99999px; top: 0; }
  #resumo { margin: 20px 0; padding: 14px 18px; border-radius: 10px; font-weight: 700; }
  #resumo.tudo-ok { background: #e6f6ec; color: #0a7d3f; }
  #resumo.tem-falha { background: #fdeceb; color: #b3261e; }
</style>
</head>
<body>
<h1>Verificação de responsividade</h1>
<p class="sub">Página testada: <strong id="alvo">/</strong>. Larguras: ${LARGURAS.join(", ")} px.</p>
<div id="resumo">Rodando...</div>
<table>
  <thead>
    <tr><th>Largura</th><th>Rolagem lateral</th><th>Fora da borda</th><th>Texto cortado</th><th>Toque &lt; 44px</th></tr>
  </thead>
  <tbody id="linhas"></tbody>
</table>

<script>
const LARGURAS = ${JSON.stringify(LARGURAS)};
const ALVO = new URLSearchParams(location.search).get("p") || "/";
document.getElementById("alvo").textContent = ALVO;

function medir(doc, win, largura) {
  const raiz = doc.documentElement;
  const fora = [];
  const cortados = [];
  const toqueCurto = [];

  doc.querySelectorAll("*").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const cs = win.getComputedStyle(el);
    if (cs.position === "fixed" || cs.visibility === "hidden") return;

    // 1. passou da borda (ignora o que está escondido de propósito)
    if ((r.right > largura + 1 || r.left < -1) && cs.overflow !== "hidden") {
      let paiEsconde = false;
      let pai = el.parentElement;
      while (pai) {
        const cp = win.getComputedStyle(pai);
        if (["hidden", "clip", "auto", "scroll"].includes(cp.overflowX)) { paiEsconde = true; break; }
        pai = pai.parentElement;
      }
      if (!paiEsconde) {
        fora.push(el.tagName.toLowerCase() + "." + String(el.className || "").split(" ")[0] +
                  " (" + Math.round(r.left) + " a " + Math.round(r.right) + ")");
      }
    }

    // 2. texto cortado
    if (el.children.length === 0 && (el.textContent || "").trim()) {
      const escondeY = ["hidden", "clip"].includes(cs.overflowY);
      const clamp = cs.webkitLineClamp && cs.webkitLineClamp !== "none";
      if ((escondeY || clamp) && el.scrollHeight > el.clientHeight + 2) {
        cortados.push(el.tagName.toLowerCase() + ': "' + el.textContent.trim().slice(0, 40) + '"');
      }
    }

    // 3. alvo de toque pequeno
    if (["A", "BUTTON"].includes(el.tagName) && r.width > 0) {
      if (r.height < 44 && el.offsetParent !== null) {
        toqueCurto.push(el.tagName.toLowerCase() + " " + Math.round(r.height) + "px: " +
                        (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 28));
      }
    }
  });

  return {
    rolagem: raiz.scrollWidth - largura,
    fora: fora.slice(0, 6),
    cortados: cortados.slice(0, 6),
    toqueCurto: toqueCurto.slice(0, 6)
  };
}

function celula(lista, sufixo) {
  if (!lista.length) return '<span class="ok">ok</span>';
  return '<span class="falha">' + lista.length + " " + sufixo + '</span><br><span class="detalhe">' +
         lista.map(t => t.replace(/</g, "&lt;")).join("<br>") + "</span>";
}

(async () => {
  const corpo = document.getElementById("linhas");
  let falhas = 0;

  for (const largura of LARGURAS) {
    const quadro = document.createElement("iframe");
    quadro.width = largura;
    quadro.height = largura < 768 ? 800 : 900;
    quadro.src = ALVO;
    document.body.appendChild(quadro);

    await new Promise(ok => quadro.addEventListener("load", ok, { once: true }));
    // deixa a página assentar (fontes, imagens, animações de entrada)
    await new Promise(r => setTimeout(r, 1400));

    // rola o quadro inteiro para acionar as animações de entrada
    const doc = quadro.contentDocument, win = quadro.contentWindow;
    doc.documentElement.style.scrollBehavior = "auto";
    const total = doc.body.scrollHeight;
    for (let y = 0; y <= total; y += 400) { win.scrollTo(0, y); await new Promise(r => setTimeout(r, 45)); }
    win.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 500));

    const r = medir(doc, win, largura);
    const rolagemOk = r.rolagem <= 0;
    if (!rolagemOk || r.fora.length || r.cortados.length || r.toqueCurto.length) falhas++;

    const linha = document.createElement("tr");
    linha.innerHTML =
      "<td><strong>" + largura + " px</strong></td>" +
      "<td>" + (rolagemOk ? '<span class="ok">ok</span>' : '<span class="falha">+' + r.rolagem + "px</span>") + "</td>" +
      "<td>" + celula(r.fora, "elem.") + "</td>" +
      "<td>" + celula(r.cortados, "trecho(s)") + "</td>" +
      "<td>" + celula(r.toqueCurto, "alvo(s)") + "</td>";
    corpo.appendChild(linha);

    quadro.remove();
    window.__RESULTADOS__ = window.__RESULTADOS__ || {};
    window.__RESULTADOS__[largura] = r;
  }

  const resumo = document.getElementById("resumo");
  resumo.className = falhas ? "tem-falha" : "tudo-ok";
  resumo.textContent = falhas
    ? falhas + " largura(s) com problema. Detalhes na tabela."
    : "Aprovado nas " + LARGURAS.length + " larguras: sem rolagem lateral, sem corte, sem alvo de toque pequeno.";
  window.__PRONTO__ = true;
})();
</script>
</body>
</html>
`;

if (!fs.existsSync(DIST)) {
  console.error("Rode `node construir.js` antes.");
  process.exit(1);
}

fs.writeFileSync(path.join(DIST, "_verificacao.html"), PAGINA, "utf8");
console.log("Testador gerado: http://localhost:5173/_verificacao.html");
console.log("Para testar outra página: ?p=/contato.html");
