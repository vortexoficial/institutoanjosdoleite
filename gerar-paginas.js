/* ============================================================
   Gera as páginas de projeto em src/paginas/projetos.

   São as páginas que o Instituto edita pelo painel: o HTML aqui é
   o conteúdo inicial (e o que aparece se o painel estiver fora do
   ar), e as marcações data-projeto-* dizem ao site onde escrever o
   que vier salvo.

   Uso: node gerar-paginas.js
        node gerar-paginas.js --forcar   reescreve as existentes
   ============================================================ */

const fs = require("fs");
const path = require("path");

const DESTINO = path.join(__dirname, "src/paginas/projetos");
const FORCAR = process.argv.includes("--forcar");

const PROJETOS = [
  {
    slug: "mae-acolhida",
    etiqueta: "Acolhimento",
    nome: "Projeto Mãe Acolhida",
    imagem: "projeto-mae-acolhida",
    resumo:
      "Acolhimento individual a mães em situação de vulnerabilidade, com escuta qualificada, orientação sobre amamentação e encaminhamento para a rede de saúde.",
    paragrafos: [
      "O Mãe Acolhida existe para chegar onde a informação costuma não chegar. Muitas mulheres desistem de amamentar não por falta de vontade, mas por falta de alguém que explique, examine e acompanhe nos primeiros dias.",
      "O projeto oferece atendimento individual, escuta qualificada e orientação prática sobre pega, ordenha, fissuras e produção de leite, sempre com base em evidências científicas. Quando o caso exige, a família é encaminhada para a rede pública de saúde com um relatório claro do que foi observado.",
      "O acompanhamento não termina no primeiro contato: a mãe segue com um canal aberto para tirar dúvidas nas semanas seguintes, que são justamente as mais difíceis."
    ]
  },
  {
    slug: "hora-do-mamaco",
    etiqueta: "Mobilização",
    nome: "Hora do Mamaço",
    imagem: "projeto-hora-do-mamaco",
    resumo:
      "A maior ação pública de incentivo ao aleitamento materno da região, realizada há 14 anos em Santos.",
    paragrafos: [
      "A Hora do Mamaço reúne mães, bebês, famílias e profissionais de saúde em um ato coletivo de amamentação. É uma demonstração pública de que amamentar em espaço público é um direito, e de que nenhuma mãe precisa se esconder para alimentar o próprio filho.",
      "O Instituto integra a organização do movimento em Santos há 14 anos e, desde 2022, responde pela coordenação. O evento acontece dentro da Semana Mundial de Aleitamento Materno e envolve secretarias, unidades de saúde, universidades e voluntários.",
      "Além do ato em si, a Hora do Mamaço leva orientação gratuita, tira dúvidas no local e aproxima famílias dos serviços que elas nem sabiam que existiam."
    ]
  },
  {
    slug: "formacao",
    etiqueta: "Formação",
    nome: "Formação e Capacitação de Profissionais",
    imagem: "projeto-formacao",
    resumo:
      "Cursos, oficinas e supervisão para enfermeiros, técnicos, doulas e estudantes, com prática baseada em evidências científicas.",
    paragrafos: [
      "Formar quem atende é multiplicar o cuidado. Uma orientação errada dada com boa intenção na maternidade pode encerrar uma amamentação que teria dado certo.",
      "O projeto oferece cursos, oficinas práticas e supervisão a profissionais de saúde e estudantes, com conteúdo atualizado e baseado em evidências: avaliação da mamada, manejo clínico, dificuldades comuns, uso de bombas e ordenha, e comunicação com a família.",
      "A formação é pensada para a realidade do serviço público e do consultório particular, com material de apoio e acompanhamento após o curso."
    ]
  },
  {
    slug: "educacao-em-saude",
    etiqueta: "Educação",
    nome: "Educação em Saúde",
    imagem: "projeto-educacao",
    resumo:
      "Rodas de conversa, palestras e conteúdo acessível para gestantes e famílias, do pré-natal aos primeiros anos.",
    paragrafos: [
      "Informação clara, no momento em que a dúvida aparece. O projeto leva conteúdo de saúde materno-infantil para gestantes, mães, pais e cuidadores em linguagem simples, sem termo técnico desnecessário e sem julgamento.",
      "As atividades acontecem em rodas de conversa, palestras em unidades de saúde, empresas e escolas, e em conteúdo publicado nos canais do Instituto.",
      "Os temas saem das perguntas que mais aparecem no atendimento: preparo na gestação, primeiros dias, retorno ao trabalho, introdução alimentar e sinais que pedem ajuda profissional."
    ]
  },
  {
    slug: "primeira-infancia",
    etiqueta: "Desenvolvimento",
    nome: "Primeira Infância",
    imagem: "projeto-primeira-infancia",
    resumo:
      "Ações voltadas ao desenvolvimento saudável nos primeiros mil dias de vida, com atenção ao vínculo, à nutrição e aos sinais que pedem cuidado especializado.",
    paragrafos: [
      "Os primeiros mil dias, da gestação aos dois anos, definem boa parte da saúde de uma pessoa para a vida inteira. É a janela em que o cuidado rende mais.",
      "O projeto acompanha famílias nesse período com orientação sobre vínculo, nutrição, sono, desenvolvimento motor e oral, e identificação precoce de sinais que pedem avaliação especializada.",
      "A atuação se apoia na formação da fundadora em enfermagem e, agora, em fonoaudiologia, com atenção especial à motricidade orofacial e ao desenvolvimento infantil."
    ]
  }
];

const pagina = (p) => `<!--dados
{
  "titulo": ${JSON.stringify(p.nome + " | Instituto Anjos do Leite")},
  "descricao": ${JSON.stringify(p.resumo)},
  "caminho": ${JSON.stringify("/projetos/" + p.slug + ".html")}
}
-->

<section class="pagina-topo">
  <div class="container">
    <p class="etiqueta" data-anima="cima"><span data-projeto-etiqueta>${p.etiqueta}</span></p>
    <h1 data-anima="cima" data-projeto-nome>${p.nome}</h1>
    <p class="pagina-topo__apoio" data-anima="cima" data-projeto-resumo>${p.resumo}</p>
  </div>
</section>

<section class="secao">
  <div class="container projeto-pagina" data-projeto-slug="${p.slug}">

    <div class="prosa" data-anima="cima" data-projeto-texto>
      ${p.paragrafos.map((t) => `<p>${t}</p>`).join("\n      ")}
    </div>

    <aside class="projeto-lado" data-anima="cima">
      <figure class="projeto-lado__foto">
        <img src="/assets/img/${p.imagem}.svg" data-img="${p.imagem}" width="1000" height="750"
             alt="${p.nome}" loading="lazy">
      </figure>

      <!-- Galeria do projeto: montada pelo site a partir do que o
           Instituto enviar no painel. Sem foto, nem aparece. -->
      <div class="projeto-lado__caixa" data-projeto-galeria-caixa hidden>
        <h2>Galeria</h2>
        <div class="projeto-galeria" data-projeto-galeria></div>
      </div>

      <div class="projeto-lado__caixa" data-projeto-acoes-caixa hidden>
        <h2>Ações em andamento</h2>
        <ul class="projeto-lado__acoes" data-projeto-acoes></ul>
      </div>

      <div class="projeto-lado__botoes">
        <a class="btn btn--principal" href="/#apoie">
          Apoiar este projeto
          <svg aria-hidden="true"><use href="#i-hand-heart"/></svg>
        </a>
        <a class="btn btn--contorno" href="/#projetos">
          Ver todos os projetos
          <svg aria-hidden="true"><use href="#i-arrow-right"/></svg>
        </a>
      </div>
    </aside>

  </div>
</section>
`;

fs.mkdirSync(DESTINO, { recursive: true });

let criadas = 0;
let puladas = 0;

for (const p of PROJETOS) {
  const destino = path.join(DESTINO, p.slug + ".html");
  if (fs.existsSync(destino) && !FORCAR) {
    puladas++;
    continue;
  }
  fs.writeFileSync(destino, pagina(p), "utf8");
  criadas++;
}

console.log(
  `${criadas} páginas de projeto gravadas` + (puladas ? `, ${puladas} já existiam (use --forcar para reescrever)` : "")
);
