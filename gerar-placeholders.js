/* ============================================================
   Gera os espaços reservados de foto (SVG) com a identidade do
   Instituto. Cada arquivo é leve, nítido em qualquer tela e
   deixa claro qual foto entra ali.

   Desenho enxuto de propósito: fundo em degradê da marca, um
   ícone de imagem em traço fino e o rótulo, tudo centralizado na
   altura. Nada de silhueta, círculo solto ou texto grudado
   embaixo: o espaço tem que sugerir a foto, não competir com ela.

   Trocar a foto de verdade se faz pelo painel (/painel), sem
   mexer em código: o HTML marca cada espaço com data-img="chave".

   Uso: node gerar-placeholders.js
   ============================================================ */

const fs = require("fs");
const path = require("path");

const DESTINO = path.join(__dirname, "assets/img");

/* Tons da marca, do mais claro ao mais escuro */
const PALETAS = [
  { a: "#7E3BAD", b: "#4A1769" },
  { a: "#6A239A", b: "#3A1157" },
  { a: "#8B4BB8", b: "#54186F" },
  { a: "#5A1C86", b: "#2E0C46" }
];

/* Ícone de imagem, em traço fino (mesmo desenho do Lucide) */
function icone(tamanho, opacidade) {
  const escala = tamanho / 24;
  return `
    <g transform="scale(${escala.toFixed(4)})" fill="none" stroke="#ffffff" stroke-opacity="${opacidade}"
       stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2.5"/>
      <circle cx="8.8" cy="8.8" r="1.6"/>
      <path d="M21 14.5l-3.6-3.6a2 2 0 0 0-2.8 0L6.2 19.8"/>
    </g>`;
}

function svg({ largura, altura, titulo, tom }) {
  const p = PALETAS[tom % PALETAS.length];
  const menor = Math.min(largura, altura);

  const tamIcone = Math.round(menor * 0.13);
  const tamTitulo = Math.round(menor * 0.055);
  const tamLegenda = Math.round(menor * 0.032);

  // o conjunto inteiro fica centralizado na altura
  const centro = altura / 2;
  const iconeY = centro - tamIcone * 1.5;
  const tituloY = centro + tamTitulo * 0.85;
  const legendaY = tituloY + tamLegenda * 2.1;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}" role="img" aria-label="${titulo}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}"/>
      <stop offset="1" stop-color="${p.b}"/>
    </linearGradient>
  </defs>

  <rect width="${largura}" height="${altura}" fill="url(#g)"/>

  <g transform="translate(${largura / 2 - tamIcone / 2} ${iconeY})">
    ${icone(tamIcone, 0.55)}
  </g>

  <g text-anchor="middle" font-family="Montserrat, Segoe UI, Arial, sans-serif">
    <text x="${largura / 2}" y="${tituloY}" fill="#ffffff" fill-opacity="0.92"
          font-size="${tamTitulo}" font-weight="700">${titulo}</text>
    <text x="${largura / 2}" y="${legendaY}" fill="#ffffff" fill-opacity="0.5"
          font-size="${tamLegenda}" font-weight="600"
          letter-spacing="${Math.round(tamLegenda * 0.18)}">ESPAÇO PARA FOTO</text>
  </g>
</svg>
`;
}

const ESPACOS = [
  // Carrossel do topo
  { arquivo: "hero-1", largura: 1600, altura: 1100, titulo: "Atendimento" },
  { arquivo: "hero-2", largura: 1600, altura: 1100, titulo: "Gestantes" },
  { arquivo: "hero-3", largura: 1600, altura: 1100, titulo: "Mãe amamentando" },
  { arquivo: "hero-4", largura: 1600, altura: 1100, titulo: "Hora do Mamaço" },
  { arquivo: "hero-5", largura: 1600, altura: 1100, titulo: "Ações sociais" },

  // História e fundadora
  { arquivo: "historia", largura: 1800, altura: 760, titulo: "Nossa história" },
  { arquivo: "fundadora", largura: 1000, altura: 1250, titulo: "Sandra Abreu" },

  // Projetos
  { arquivo: "projeto-mae-acolhida", largura: 1000, altura: 750, titulo: "Mãe Acolhida" },
  { arquivo: "projeto-hora-do-mamaco", largura: 1000, altura: 750, titulo: "Hora do Mamaço" },
  { arquivo: "projeto-formacao", largura: 1000, altura: 750, titulo: "Formação" },
  { arquivo: "projeto-educacao", largura: 1000, altura: 750, titulo: "Educação em Saúde" },
  { arquivo: "projeto-primeira-infancia", largura: 1000, altura: 750, titulo: "Primeira Infância" },
  { arquivo: "projeto-generico", largura: 1000, altura: 750, titulo: "Projeto" },

  // Prova social
  { arquivo: "depoimento-1", largura: 600, altura: 600, titulo: "Mãe atendida" },
  { arquivo: "depoimento-2", largura: 600, altura: 600, titulo: "Mãe atendida" },
  { arquivo: "depoimento-3", largura: 600, altura: 600, titulo: "Profissional" },
  // Galeria do Instituto (palco horizontal na home)
  { arquivo: "galeria-1", largura: 1000, altura: 1250, titulo: "Atendimento" },
  { arquivo: "galeria-2", largura: 1000, altura: 1250, titulo: "Hora do Mamaço" },
  { arquivo: "galeria-3", largura: 1000, altura: 1250, titulo: "Roda de conversa" },
  { arquivo: "galeria-4", largura: 1000, altura: 1250, titulo: "Formação" },
  { arquivo: "galeria-5", largura: 1000, altura: 1250, titulo: "Ação social" },
  { arquivo: "galeria-6", largura: 1000, altura: 1250, titulo: "Homenagem" },
  { arquivo: "galeria-7", largura: 1000, altura: 1250, titulo: "Congresso" },
  { arquivo: "galeria-8", largura: 1000, altura: 1250, titulo: "Equipe" },

  // Galeria da página da fundadora
  { arquivo: "galeria-homenagens", largura: 900, altura: 900, titulo: "Homenagens" },
  { arquivo: "galeria-camara", largura: 900, altura: 900, titulo: "Câmara Municipal" },
  { arquivo: "galeria-capep", largura: 900, altura: 900, titulo: "CAPEP" },
  { arquivo: "galeria-mamaco", largura: 900, altura: 900, titulo: "Hora do Mamaço" },
  { arquivo: "galeria-entrevistas", largura: 900, altura: 900, titulo: "Entrevistas" },
  { arquivo: "galeria-podcasts", largura: 900, altura: 900, titulo: "Podcasts" },
  { arquivo: "galeria-congressos", largura: 900, altura: 900, titulo: "Congressos" },
  { arquivo: "galeria-atendimentos", largura: 900, altura: 900, titulo: "Atendimentos" }
];

fs.mkdirSync(DESTINO, { recursive: true });

let total = 0;
ESPACOS.forEach((e, i) => {
  const conteudo = svg({ ...e, tom: i });
  fs.writeFileSync(path.join(DESTINO, e.arquivo + ".svg"), conteudo, "utf8");
  total += Buffer.byteLength(conteudo);
});

console.log(`${ESPACOS.length} espaços gerados em assets/img (${Math.round(total / 1024)} KB no total)`);
