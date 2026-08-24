/* ============================================================
   Gera os espaços reservados de foto (SVG) com a identidade do
   Instituto. Cada arquivo é leve, nítido em qualquer tela e
   deixa claro qual foto entra ali.

   Trocar a foto de verdade se faz pelo painel (/painel), sem
   mexer em código: o HTML marca cada espaço com data-img="chave".

   Uso: node gerar-placeholders.js
   ============================================================ */

const fs = require("fs");
const path = require("path");

const DESTINO = path.join(__dirname, "assets/img");

const ROXO = "#6A239A";
const ROXO_ESCURO = "#3F1259";
const ROXO_CLARO = "#8B4BB8";
const AMBAR = "#FBB921";

/* Silhueta de mãe com bebê, no espírito do símbolo da marca. */
function silhueta(cor, opacidade) {
  return `
    <g fill="${cor}" opacity="${opacidade}">
      <circle cx="0" cy="-108" r="52"/>
      <path d="M-96 -46 C-96 -96 96 -96 96 -46 L96 40 C96 92 58 124 0 124 C-58 124 -96 92 -96 40 Z"/>
      <circle cx="46" cy="26" r="38" fill="#ffffff" opacity="0.92"/>
      <path d="M-52 28 C-52 -8 4 -20 42 4 C72 22 66 76 26 84 C-14 92 -52 66 -52 28 Z" fill="#ffffff" opacity="0.92"/>
    </g>`;
}

function svg({ largura, altura, titulo, legenda, tom }) {
  const paletas = [
    { a: ROXO, b: ROXO_ESCURO },
    { a: ROXO_CLARO, b: ROXO },
    { a: ROXO_ESCURO, b: "#2A0B3D" },
    { a: ROXO, b: "#54186F" },
  ];
  const p = paletas[tom % paletas.length];
  const escala = Math.min(largura, altura) / 620;
  const cy = altura / 2 - altura * 0.055;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}" role="img" aria-label="${titulo}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/>
      <stop offset="1" stop-color="${p.b}"/>
    </linearGradient>
    <radialGradient id="brilho" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${largura}" height="${altura}" fill="url(#g)"/>
  <rect width="${largura}" height="${altura}" fill="url(#brilho)"/>

  <circle cx="${largura * 0.86}" cy="${altura * 0.16}" r="${Math.min(largura, altura) * 0.3}" fill="#ffffff" opacity="0.05"/>
  <circle cx="${largura * 0.12}" cy="${altura * 0.9}" r="${Math.min(largura, altura) * 0.24}" fill="${AMBAR}" opacity="0.09"/>

  <g transform="translate(${largura / 2} ${cy}) scale(${escala})">
    ${silhueta("#ffffff", 0.2)}
  </g>

  <g transform="translate(${largura / 2} ${altura * 0.84})" text-anchor="middle"
     font-family="Montserrat, Segoe UI, Arial, sans-serif">
    <text y="0" fill="${AMBAR}" font-size="${Math.round(Math.min(largura, altura) * 0.038)}"
          font-weight="700" letter-spacing="${Math.round(Math.min(largura, altura) * 0.012)}"
          opacity="0.95">ESPAÇO PARA FOTO</text>
    <text y="${Math.round(Math.min(largura, altura) * 0.085)}" fill="#ffffff"
          font-size="${Math.round(Math.min(largura, altura) * 0.055)}" font-weight="700"
          opacity="0.95">${titulo}</text>
    ${legenda ? `<text y="${Math.round(Math.min(largura, altura) * 0.14)}" fill="#ffffff" opacity="0.6"
          font-size="${Math.round(Math.min(largura, altura) * 0.034)}" font-weight="400">${legenda}</text>` : ""}
  </g>
</svg>
`;
}

const ESPACOS = [
  // Carrossel do topo
  { arquivo: "hero-1", largura: 1600, altura: 1100, titulo: "Atendimento", legenda: "Consulta de amamentação" },
  { arquivo: "hero-2", largura: 1600, altura: 1100, titulo: "Gestantes", legenda: "Preparo para a chegada do bebê" },
  { arquivo: "hero-3", largura: 1600, altura: 1100, titulo: "Mãe amamentando", legenda: "O vínculo no começo da vida" },
  { arquivo: "hero-4", largura: 1600, altura: 1100, titulo: "Hora do Mamaço", legenda: "Mobilização em Santos" },
  { arquivo: "hero-5", largura: 1600, altura: 1100, titulo: "Ações sociais", legenda: "O Instituto na comunidade" },

  // História e fundadora
  { arquivo: "historia", largura: 1800, altura: 760, titulo: "Nossa história", legenda: "Foto panorâmica: atendimento ou Hora do Mamaço" },
  { arquivo: "fundadora", largura: 1000, altura: 1250, titulo: "Sandra Abreu", legenda: "Fundadora e presidente" },

  // Projetos
  { arquivo: "projeto-mae-acolhida", largura: 1000, altura: 750, titulo: "Mãe Acolhida", legenda: "" },
  { arquivo: "projeto-hora-do-mamaco", largura: 1000, altura: 750, titulo: "Hora do Mamaço", legenda: "" },
  { arquivo: "projeto-formacao", largura: 1000, altura: 750, titulo: "Formação", legenda: "" },
  { arquivo: "projeto-educacao", largura: 1000, altura: 750, titulo: "Educação em Saúde", legenda: "" },
  { arquivo: "projeto-primeira-infancia", largura: 1000, altura: 750, titulo: "Primeira Infância", legenda: "" },

  // Prova social
  { arquivo: "depoimento-1", largura: 600, altura: 600, titulo: "Mãe atendida", legenda: "" },
  { arquivo: "depoimento-2", largura: 600, altura: 600, titulo: "Mãe atendida", legenda: "" },
  { arquivo: "depoimento-3", largura: 600, altura: 600, titulo: "Profissional", legenda: "" },
];

fs.mkdirSync(DESTINO, { recursive: true });

let total = 0;
ESPACOS.forEach((e, i) => {
  const conteudo = svg({ ...e, tom: i });
  fs.writeFileSync(path.join(DESTINO, e.arquivo + ".svg"), conteudo, "utf8");
  total += Buffer.byteLength(conteudo);
});

console.log(`${ESPACOS.length} espaços gerados em assets/img (${Math.round(total / 1024)} KB no total)`);
