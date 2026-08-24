/* ============================================================
   Gera o miolo das páginas internas em src/paginas.

   Existe para que nenhum link do menu ou do rodapé caia em 404
   enquanto as páginas definitivas não são escritas. As que já têm
   texto aprovado no briefing (fundadora, instituto, projetos,
   contato, apoie, transparência, privacidade) nascem com conteúdo
   de verdade; as demais nascem com a estrutura e um aviso honesto
   do que vai entrar.

   Roda uma vez e não sobrescreve nada: página que já existe é
   pulada, para não apagar trabalho feito à mão depois.

   Uso: node gerar-paginas.js
   ============================================================ */

const fs = require("fs");
const path = require("path");

const DESTINO = path.join(__dirname, "src/paginas");

/* ---------- pedaços reutilizáveis ---------- */

const topo = (etiqueta, titulo, apoio) => `
<section class="pagina-topo">
  <div class="container">
    <p class="etiqueta" data-anima="cima">${etiqueta}</p>
    <h1 data-anima="cima">${titulo}</h1>
    ${apoio ? `<p class="pagina-topo__apoio" data-anima="cima">${apoio}</p>` : ""}
  </div>
</section>`;

const emProducao = (titulo, itens, voltarPara = "/", voltarTexto = "Voltar para a página inicial") => `
<section class="secao">
  <div class="container">
    <div class="producao" data-anima="cima">
      <span class="producao__icone" aria-hidden="true"><svg><use href="#i-sparkles"/></svg></span>
      <h2>${titulo}</h2>
      <p>
        Esta página está em produção. A estrutura já está definida e entra no ar assim que
        o Instituto enviar o material.
      </p>
      <ul class="producao__lista">
        ${itens.map((i) => `<li><svg aria-hidden="true"><use href="#i-check"/></svg> ${i}</li>`).join("\n        ")}
      </ul>
      <a class="btn btn--roxo" href="${voltarPara}">
        ${voltarTexto}
        <svg aria-hidden="true"><use href="#i-arrow-right"/></svg>
      </a>
    </div>
  </div>
</section>`;

const dados = (titulo, descricao, caminho) =>
  `<!--dados\n{\n  "titulo": ${JSON.stringify(titulo)},\n  "descricao": ${JSON.stringify(descricao)},\n  "caminho": ${JSON.stringify(caminho)}\n}\n-->\n`;

/* ---------- páginas ---------- */

const PAGINAS = [];

/* O Instituto ------------------------------------------------ */
PAGINAS.push({
  arquivo: "instituto.html",
  titulo: "O Instituto | Instituto Anjos do Leite",
  descricao:
    "História, missão, visão e valores do Instituto Anjos do Leite de Apoio à Amamentação e à Primeira Infância.",
  caminho: "/instituto.html",
  conteudo:
    topo(
      "O Instituto",
      "Antes mesmo de existir como Instituto,<br>já existia uma missão",
      "Durante 28 anos de atuação na enfermagem e mais de duas décadas dedicadas ao aleitamento materno, milhares de mães cruzaram nosso caminho."
    ) +
    `
<section class="secao">
  <div class="container">
    <div class="prosa" data-anima="cima">
      <p>
        Cada atendimento revelou uma realidade comum: muitas mulheres desejavam amamentar,
        mas enfrentavam esse desafio sem informação, apoio ou acolhimento.
      </p>
      <p>
        Foi dessa experiência que nasceu a Anjos do Leite e, posteriormente, o
        <strong>Instituto Anjos do Leite de Apoio à Amamentação e à Primeira Infância</strong>.
      </p>
      <p>
        Hoje o Instituto desenvolve projetos voltados à promoção da amamentação, da primeira
        infância, da educação em saúde, da capacitação de profissionais e do fortalecimento
        das famílias, acreditando que investir no começo da vida é transformar toda a sociedade.
      </p>
    </div>

    <div class="proposito__grade" style="margin-top:clamp(2.5rem,2rem+3vw,4rem)">
      <article class="quadro quadro--missao" data-anima="quadro">
        <img class="quadro__marca" src="/assets/simbolo.webp" alt="" aria-hidden="true" loading="lazy">
        <div class="quadro__cabeca">
          <span class="quadro__num">01</span>
          <span class="quadro__icone" aria-hidden="true"><svg><use href="#i-target"/></svg></span>
        </div>
        <h2>Missão</h2>
        <p>
          Promover acolhimento, educação em saúde e apoio qualificado à amamentação e à
          primeira infância, fortalecendo mães, bebês, famílias e profissionais por meio de
          ações baseadas em <strong>evidências científicas, humanização e impacto social</strong>.
        </p>
      </article>

      <article class="quadro quadro--visao" data-anima="quadro">
        <div class="quadro__cabeca">
          <span class="quadro__num">02</span>
          <span class="quadro__icone" aria-hidden="true"><svg><use href="#i-eye"/></svg></span>
        </div>
        <h2>Visão</h2>
        <p>
          Ser referência nacional em ações de promoção da amamentação, da primeira infância
          e do fortalecimento das famílias, contribuindo para que toda criança tenha um
          <strong>começo de vida mais saudável, protegido e digno</strong>.
        </p>
      </article>
    </div>
  </div>
</section>

<div class="valores" data-anima="cima">
  <div class="container valores__cabeca">
    <span class="quadro__num">03</span>
    <div>
      <h2>Valores</h2>
      <p>Princípios inegociáveis em tudo o que o Instituto faz</p>
    </div>
  </div>
  <div class="valores__janela" data-laco data-laco-velocidade="34">
    <ul class="valores__trilho" data-laco-trilho>
      <li class="valor">Humanização</li>
      <li class="valor">Ética</li>
      <li class="valor">Ciência</li>
      <li class="valor">Respeito</li>
      <li class="valor">Acolhimento</li>
      <li class="valor">Transparência</li>
      <li class="valor">Amor ao próximo</li>
      <li class="valor">Compromisso com a primeira infância</li>
      <li class="valor">Excelência</li>
    </ul>
  </div>
</div>

<section class="secao">
  <div class="container">
    <div class="chamada" data-anima="cima">
      <h2>Conheça quem começou tudo isso</h2>
      <p>A trajetória de Sandra Abreu, fundadora e presidente do Instituto.</p>
      <div class="chamada__acoes">
        <a class="btn btn--roxo" href="/fundadora.html">
          Ver a página da fundadora
          <svg aria-hidden="true"><use href="#i-arrow-right"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>`
});

/* Fundadora --------------------------------------------------- */
PAGINAS.push({
  arquivo: "fundadora.html",
  titulo: "Sandra Abreu, fundadora e presidente | Instituto Anjos do Leite",
  descricao:
    "Sandra Abreu, enfermeira (COREN-SP 216353) e especialista em aleitamento materno, é fundadora e presidente do Instituto Anjos do Leite. Mais de 27 mil atendimentos a gestantes, mães, bebês e famílias.",
  caminho: "/fundadora.html",
  conteudo:
    topo(
      "Fundadora e presidente",
      "Sandra Abreu",
      "Enfermeira, especialista em aleitamento materno e pioneira na Assessoria Especializada em Amamentação da Baixada Santista."
    ) +
    `
<section class="secao">
  <div class="container fundadora__grade">
    <div class="fundadora__foto" data-anima="esquerda">
      <img src="/assets/img/fundadora.svg" data-img="fundadora" width="1000" height="1250"
           alt="Sandra Abreu, fundadora e presidente do Instituto Anjos do Leite" loading="lazy">
    </div>

    <div class="prosa" data-anima="cima">
      <p>
        Sandra Abreu iniciou sua trajetória na área da saúde há 28 anos, atuando inicialmente
        como auxiliar de enfermagem, posteriormente como técnica de enfermagem e, em 2006,
        graduou-se em Enfermagem, consolidando uma carreira dedicada ao cuidado materno-infantil.
      </p>
      <p>
        É Enfermeira (COREN-SP 216353) e Especialista em Aleitamento Materno (Título de
        Especialista nº 38244), sendo reconhecida como <strong>pioneira na Assessoria
        Especializada em Amamentação na Baixada Santista</strong>.
      </p>
      <p>
        Ao longo de sua trajetória, já realizou mais de 27 mil atendimentos a gestantes, mães,
        bebês e famílias, unindo conhecimento técnico, acolhimento e prática baseada em
        evidências científicas.
      </p>
      <p>
        Atualmente está concluindo a graduação em Fonoaudiologia, ampliando sua atuação nas
        áreas de motricidade orofacial, desenvolvimento infantil e primeira infância.
      </p>
      <p>
        Recebeu homenagens e reconhecimentos por sua contribuição à promoção do aleitamento
        materno e da saúde materno-infantil, além de participar frequentemente de congressos,
        entrevistas, eventos científicos, ações sociais e projetos de educação em saúde.
      </p>
      <p>
        Integra a organização da Hora do Mamaço Santos há 14 anos e, desde 2022, atua como
        coordenadora do movimento, liderando uma das maiores ações de incentivo ao aleitamento
        materno da região.
      </p>
    </div>
  </div>
</section>

<section class="secao secao--alt">
  <div class="container">
    <div class="cabecalho-secao" data-anima="cima">
      <p class="etiqueta">Registro profissional</p>
      <h2>Formação e credenciais</h2>
    </div>

    <div class="credenciais">
      <article class="credencial" data-anima="cima">
        <span class="credencial__icone" aria-hidden="true"><svg><use href="#i-badge-check"/></svg></span>
        <strong>COREN-SP 216353</strong>
        <span>Enfermeira, graduada em 2006</span>
      </article>
      <article class="credencial" data-anima="cima">
        <span class="credencial__icone" aria-hidden="true"><svg><use href="#i-graduation-cap"/></svg></span>
        <strong>Especialista nº 38244</strong>
        <span>Título de Especialista em Aleitamento Materno</span>
      </article>
      <article class="credencial" data-anima="cima">
        <span class="credencial__icone" aria-hidden="true"><svg><use href="#i-stethoscope"/></svg></span>
        <strong>Fonoaudiologia</strong>
        <span>Graduação em conclusão: motricidade orofacial e primeira infância</span>
      </article>
      <article class="credencial" data-anima="cima">
        <span class="credencial__icone" aria-hidden="true"><svg><use href="#i-calendar-heart"/></svg></span>
        <strong>Hora do Mamaço Santos</strong>
        <span>14 anos na organização, coordenadora desde 2022</span>
      </article>
    </div>
  </div>
</section>

<section class="secao">
  <div class="container">
    <div class="cabecalho-secao" data-anima="cima">
      <p class="etiqueta">Galeria</p>
      <h2>Trajetória em imagens</h2>
      <p>Homenagens, eventos científicos, imprensa e ações da causa.</p>
    </div>

    <div class="galeria" data-anima="cima">
      <figure class="galeria__item" data-img="galeria-homenagens"><figcaption>Homenagens</figcaption></figure>
      <figure class="galeria__item" data-img="galeria-camara"><figcaption>Câmara Municipal</figcaption></figure>
      <figure class="galeria__item" data-img="galeria-capep"><figcaption>CAPEP</figcaption></figure>
      <figure class="galeria__item" data-img="galeria-mamaco"><figcaption>Hora do Mamaço</figcaption></figure>
      <figure class="galeria__item" data-img="galeria-entrevistas"><figcaption>Entrevistas</figcaption></figure>
      <figure class="galeria__item" data-img="galeria-podcasts"><figcaption>Podcasts</figcaption></figure>
      <figure class="galeria__item" data-img="galeria-congressos"><figcaption>Congressos</figcaption></figure>
      <figure class="galeria__item" data-img="galeria-atendimentos"><figcaption>Atendimentos</figcaption></figure>
    </div>
  </div>
</section>

<section class="secao secao--alt">
  <div class="container">
    <figure class="assinatura" data-anima="cima">
      <svg class="assinatura__aspas" aria-hidden="true"><use href="#i-quote"/></svg>
      <blockquote>
        Acredito que toda mãe merece ser acolhida, toda família merece apoio e toda criança
        merece um começo de vida saudável. Foi dessa convicção que nasceu o Instituto Anjos do Leite.
      </blockquote>
      <figcaption>
        <strong>Sandra Abreu</strong>
        <span>Fundadora e presidente do Instituto</span>
      </figcaption>
    </figure>
  </div>
</section>`
});

/* Projetos (índice) ------------------------------------------- */
const PROJETOS = [
  {
    slug: "mae-acolhida",
    etiqueta: "Acolhimento",
    nome: "Projeto Mãe Acolhida",
    img: "projeto-mae-acolhida",
    texto:
      "Acolhimento individual a mães em situação de vulnerabilidade, com escuta qualificada, orientação sobre amamentação e encaminhamento para a rede de saúde. Chega onde a informação costuma não chegar."
  },
  {
    slug: "hora-do-mamaco",
    etiqueta: "Mobilização",
    nome: "Hora do Mamaço",
    img: "projeto-hora-do-mamaco",
    texto:
      "A maior ação pública de incentivo ao aleitamento materno da região. Reúne mães, bebês, famílias e profissionais em um ato coletivo de amamentação, realizado há 14 anos em Santos."
  },
  {
    slug: "formacao",
    etiqueta: "Formação",
    nome: "Formação e Capacitação de Profissionais",
    img: "projeto-formacao",
    texto:
      "Cursos, oficinas e supervisão para enfermeiros, técnicos, doulas e estudantes, com prática baseada em evidências científicas. Formar quem atende é multiplicar o cuidado."
  },
  {
    slug: "educacao-em-saude",
    etiqueta: "Educação",
    nome: "Educação em Saúde",
    img: "projeto-educacao",
    texto:
      "Rodas de conversa, palestras e conteúdo acessível para gestantes e famílias, do pré-natal aos primeiros anos. Informação clara no momento em que a dúvida aparece."
  },
  {
    slug: "primeira-infancia",
    etiqueta: "Desenvolvimento",
    nome: "Primeira Infância",
    img: "projeto-primeira-infancia",
    texto:
      "Ações voltadas ao desenvolvimento saudável nos primeiros mil dias de vida, com atenção ao vínculo, à nutrição e aos sinais que pedem cuidado especializado."
  }
];

PAGINAS.push({
  arquivo: "projetos.html",
  titulo: "Projetos | Instituto Anjos do Leite",
  descricao:
    "As cinco frentes de trabalho do Instituto Anjos do Leite: Mãe Acolhida, Hora do Mamaço, Formação de Profissionais, Educação em Saúde e Primeira Infância.",
  caminho: "/projetos.html",
  conteudo:
    topo(
      "Projetos e ações",
      "Onde o cuidado vira prática",
      "Cinco frentes de trabalho que alcançam mães, bebês, famílias e profissionais de saúde da Baixada Santista."
    ) +
    `
<section class="secao">
  <div class="container">
    <div class="projetos">
      ${PROJETOS.map(
        (p) => `<article class="projeto" data-anima="cima">
        <div class="projeto__foto">
          <img src="/assets/img/${p.img}.svg" data-img="${p.img}" width="1000" height="750"
               alt="${p.nome}" loading="lazy">
          <span class="projeto__etiqueta">${p.etiqueta}</span>
        </div>
        <div class="projeto__corpo">
          <h2>${p.nome}</h2>
          <p>${p.texto}</p>
          <a class="link-seta" href="/projetos/${p.slug}.html">
            Conhecer o projeto
            <svg aria-hidden="true"><use href="#i-arrow-right"/></svg>
          </a>
        </div>
      </article>`
      ).join("\n      ")}
    </div>
  </div>
</section>`
});

/* Páginas de cada projeto ------------------------------------- */
PROJETOS.forEach((p) => {
  PAGINAS.push({
    arquivo: path.join("projetos", p.slug + ".html"),
    titulo: p.nome + " | Instituto Anjos do Leite",
    descricao: p.texto,
    caminho: "/projetos/" + p.slug + ".html",
    conteudo:
      topo(p.etiqueta, p.nome, p.texto) +
      emProducao(
        "Página do projeto em produção",
        [
          "O que é o projeto e para quem",
          "Como funciona, passo a passo",
          "Resultados em números",
          "Galeria de fotos das ações",
          "Como participar ou apoiar"
        ],
        "/projetos.html",
        "Ver todos os projetos"
      )
  });
});

/* Transparência ----------------------------------------------- */
PAGINAS.push({
  arquivo: "transparencia.html",
  titulo: "Transparência | Instituto Anjos do Leite",
  descricao:
    "Ficha institucional, estatuto, diretoria, relatórios de atividades e prestação de contas do Instituto Anjos do Leite.",
  caminho: "/transparencia.html",
  conteudo:
    topo(
      "Transparência",
      "Contas abertas,<br>confiança construída",
      "Quem apoia o Instituto tem o direito de saber para onde vai cada recurso. Os documentos ficam aqui, em consulta pública, sem pedido e sem cadastro."
    ) +
    `
<section class="secao">
  <div class="container">
    <div class="ficha ficha--clara" data-anima="cima">
      <h2>Ficha institucional</h2>
      <dl class="ficha__lista">
        <div class="ficha__linha">
          <dt>Razão social</dt>
          <dd data-campo="razao-social">Instituto Anjos do Leite de Apoio à Amamentação e à Primeira Infância</dd>
        </div>
        <div class="ficha__linha">
          <dt>CNPJ</dt>
          <dd class="ficha__destaque" data-campo="cnpj">00.000.000/0001-00</dd>
        </div>
        <div class="ficha__linha">
          <dt>Natureza jurídica</dt>
          <dd>Associação privada sem fins lucrativos</dd>
        </div>
        <div class="ficha__linha">
          <dt>Sede</dt>
          <dd data-campo="endereco">Santos, Baixada Santista, São Paulo</dd>
        </div>
      </dl>
    </div>
  </div>
</section>` +
      emProducao(
        "Documentos em publicação",
        [
          "Estatuto social em PDF",
          "Diretoria: nome, cargo e mandato de cada integrante",
          "Relatórios de atividades por exercício",
          "Prestação de contas: origem e destino dos recursos",
          "Certidões de regularidade"
        ]
      )
});

/* Imprensa ----------------------------------------------------- */
PAGINAS.push({
  arquivo: "imprensa.html",
  titulo: "Imprensa | Instituto Anjos do Leite",
  descricao:
    "Espaço de imprensa do Instituto Anjos do Leite: contato para entrevistas, materiais e registros na mídia.",
  caminho: "/imprensa.html",
  conteudo:
    topo(
      "Imprensa",
      "Para jornalistas e veículos",
      "O Instituto atende a imprensa em pautas sobre amamentação, primeira infância e saúde materno-infantil."
    ) +
      emProducao("Sala de imprensa em produção", [
        "Contato direto para entrevistas e pautas",
        "Registros do Instituto na mídia",
        "Fotos em alta resolução e marca para uso editorial",
        "Dados e referências para reportagens"
      ])
});

/* Parceiros ---------------------------------------------------- */
PAGINAS.push({
  arquivo: "parceiros.html",
  titulo: "Parceiros e apoiadores | Instituto Anjos do Leite",
  descricao:
    "Instituições, empresas e profissionais que sustentam os projetos do Instituto Anjos do Leite.",
  caminho: "/parceiros.html",
  conteudo:
    topo(
      "Parceiros e apoiadores",
      "Ninguém cuida sozinho",
      "Instituições, empresas e profissionais que sustentam os projetos do Instituto."
    ) +
      emProducao(
        "Página de parceiros em produção",
        [
          "Logotipos e apresentação de cada parceiro",
          "Formatos de patrocínio e contrapartidas",
          "Como sua empresa pode apoiar um projeto",
          "Relatório de impacto para patrocinadores"
        ],
        "/apoie.html",
        "Ver como apoiar"
      )
});

/* Apoie -------------------------------------------------------- */
PAGINAS.push({
  arquivo: "apoie.html",
  titulo: "Apoie nossos projetos | Instituto Anjos do Leite",
  descricao:
    "Empresas, pessoas físicas e voluntários: três caminhos para apoiar o Instituto Anjos do Leite.",
  caminho: "/apoie.html",
  conteudo:
    topo(
      "Faça parte",
      "Apoie nossos projetos",
      "Cada apoio se transforma em atendimento, formação e acolhimento para famílias que precisam de orientação no começo da vida."
    ) +
    `
<section class="secao secao--escura">
  <div class="container">
    <div class="apoio">
      <article class="apoio__card" id="empresas" data-anima="cima">
        <span class="icone-circulo" aria-hidden="true"><svg><use href="#i-building-2"/></svg></span>
        <h2>Empresas</h2>
        <p>Patrocine um projeto e associe sua marca a uma causa de impacto social mensurável.</p>
        <ul>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Contrapartidas institucionais</li>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Relatório de impacto</li>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Ações com colaboradores</li>
        </ul>
        <a class="btn btn--principal" href="/contato.html">
          Falar sobre patrocínio
          <svg aria-hidden="true"><use href="#i-arrow-right"/></svg>
        </a>
      </article>

      <article class="apoio__card" id="doacao" data-anima="cima">
        <span class="icone-circulo" aria-hidden="true"><svg><use href="#i-hand-heart"/></svg></span>
        <h2>Pessoa física</h2>
        <p>Uma doação pontual ou mensal sustenta o atendimento de quem não tem a quem recorrer.</p>
        <ul>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Doação por Pix</li>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Apoio mensal</li>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Doação de materiais</li>
        </ul>
        <a class="btn btn--principal" href="/contato.html">
          Quero doar
          <svg aria-hidden="true"><use href="#i-arrow-right"/></svg>
        </a>
      </article>

      <article class="apoio__card" id="voluntariado" data-anima="cima">
        <span class="icone-circulo" aria-hidden="true"><svg><use href="#i-users"/></svg></span>
        <h2>Voluntariado</h2>
        <p>Profissionais de saúde, estudantes e voluntários de apoio são sempre bem-vindos.</p>
        <ul>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Enfermagem e saúde</li>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Apoio em eventos</li>
          <li><svg aria-hidden="true"><use href="#i-check"/></svg> Comunicação e captação</li>
        </ul>
        <a class="btn btn--principal" href="/contato.html">
          Ser voluntário
          <svg aria-hidden="true"><use href="#i-arrow-right"/></svg>
        </a>
      </article>
    </div>
  </div>
</section>

<section class="secao">
  <div class="container">
    <div class="aviso" data-anima="cima">
      <svg aria-hidden="true"><use href="#i-shield-check"/></svg>
      <p>
        Os canais de doação (chave Pix institucional e conta bancária) serão publicados assim
        que a documentação do Instituto estiver concluída. Até lá, fale com a equipe pelos
        canais de contato.
      </p>
    </div>
  </div>
</section>`
});

/* Contato ------------------------------------------------------ */
PAGINAS.push({
  arquivo: "contato.html",
  titulo: "Contato | Instituto Anjos do Leite",
  descricao:
    "Fale com o Instituto Anjos do Leite: WhatsApp, redes sociais e formulário de contato.",
  caminho: "/contato.html",
  conteudo:
    topo(
      "Contato",
      "Fale com o Instituto",
      "Se você é mãe, profissional de saúde, empresa, imprensa ou representante público, fale com a gente. Respondemos a todas as mensagens."
    ) +
    `
<section class="secao">
  <div class="container contato__grade">
    <div class="contato__canais" data-anima="cima">
      <h2>Canais diretos</h2>

      <a class="canal" href="https://wa.me/5511964956563" target="_blank" rel="noopener">
        <span class="canal__icone" aria-hidden="true"><svg><use href="#i-marca-whatsapp"/></svg></span>
        <span class="canal__texto">
          <strong>WhatsApp</strong>
          <span data-campo="whatsapp">(11) 96495-6563</span>
        </span>
        <svg class="canal__seta" aria-hidden="true"><use href="#i-arrow-up-right"/></svg>
      </a>

      <a class="canal" href="https://instagram.com/futuradesign_br" target="_blank" rel="noopener">
        <span class="canal__icone" aria-hidden="true"><svg><use href="#i-marca-instagram"/></svg></span>
        <span class="canal__texto">
          <strong>Instagram</strong>
          <span>@futuradesign_br</span>
        </span>
        <svg class="canal__seta" aria-hidden="true"><use href="#i-arrow-up-right"/></svg>
      </a>

      <div class="canal canal--simples">
        <span class="canal__icone" aria-hidden="true"><svg><use href="#i-map-pin"/></svg></span>
        <span class="canal__texto">
          <strong>Onde atuamos</strong>
          <span data-campo="endereco">Santos, Baixada Santista, São Paulo</span>
        </span>
      </div>
    </div>

    <form class="formulario" data-anima="cima" action="/api/contato" method="post">
      <h2>Envie uma mensagem</h2>

      <label for="nome">Nome</label>
      <input type="text" id="nome" name="nome" autocomplete="name" required>

      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" autocomplete="email" required>

      <label for="assunto">Assunto</label>
      <select id="assunto" name="assunto">
        <option>Quero atendimento ou orientação</option>
        <option>Sou profissional de saúde</option>
        <option>Quero apoiar ou patrocinar</option>
        <option>Sou da imprensa</option>
        <option>Outro assunto</option>
      </select>

      <label for="mensagem">Mensagem</label>
      <textarea id="mensagem" name="mensagem" rows="5" required></textarea>

      <button class="btn btn--roxo" type="submit">
        Enviar mensagem
        <svg aria-hidden="true"><use href="#i-mail"/></svg>
      </button>

      <p class="formulario__aviso">
        O envio do formulário entra no ar junto com o painel do Instituto. Enquanto isso, o
        WhatsApp é o caminho mais rápido.
      </p>
    </form>
  </div>
</section>`
});

/* Privacidade --------------------------------------------------- */
PAGINAS.push({
  arquivo: "privacidade.html",
  titulo: "Política de Privacidade e LGPD | Instituto Anjos do Leite",
  descricao:
    "Como o Instituto Anjos do Leite trata os dados pessoais coletados no site, conforme a Lei Geral de Proteção de Dados.",
  caminho: "/privacidade.html",
  conteudo:
    topo("Documentos", "Política de Privacidade", "Como tratamos os dados pessoais coletados neste site.") +
    `
<section class="secao">
  <div class="container">
    <div class="prosa prosa--documento" data-anima="cima">
      <h2>Quais dados coletamos</h2>
      <p>
        Este site coleta apenas os dados que você mesmo informa no formulário de contato:
        nome, e-mail, assunto e mensagem. Não usamos formulários de cadastro, não vendemos
        dados e não compartilhamos suas informações com terceiros para fins comerciais.
      </p>

      <h2>Para que usamos</h2>
      <p>
        Os dados enviados são usados apenas para responder à sua mensagem e, quando for o
        caso, dar seguimento a um atendimento, uma parceria ou uma doação.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <p>
        As mensagens ficam armazenadas pelo tempo necessário ao atendimento e são eliminadas
        quando deixam de ser úteis para essa finalidade.
      </p>

      <h2 id="lgpd">Seus direitos (LGPD)</h2>
      <p>
        Conforme a Lei nº 13.709/2018, a Lei Geral de Proteção de Dados, você pode solicitar
        a qualquer momento a confirmação de que tratamos seus dados, o acesso a eles, a
        correção de informações incompletas ou desatualizadas, a portabilidade e a eliminação
        dos dados tratados com o seu consentimento.
      </p>
      <p>
        Para exercer qualquer um desses direitos, fale com o Instituto pelos canais da
        <a href="/contato.html">página de contato</a>.
      </p>

      <h2>Cookies</h2>
      <p>
        Este site não usa cookies de rastreamento nem ferramentas de publicidade. O navegador
        pode guardar preferências locais para melhorar a navegação, e nada disso é enviado ao
        Instituto.
      </p>

      <h2>Fotografias</h2>
      <p>
        As imagens publicadas neste site são utilizadas mediante autorização de uso de imagem
        das pessoas retratadas ou de seus responsáveis legais, quando se tratar de crianças.
        Se você identificar uma imagem publicada sem autorização, fale com o Instituto para
        que ela seja retirada imediatamente.
      </p>

      <p class="prosa__nota">
        Este texto é a versão inicial da política e será revisado por assessoria jurídica
        antes da publicação definitiva do site.
      </p>
    </div>
  </div>
</section>`
});

/* ---------- gravação ---------- */

let criadas = 0;
let puladas = 0;

for (const p of PAGINAS) {
  const destino = path.join(DESTINO, p.arquivo);
  if (fs.existsSync(destino)) {
    puladas++;
    continue;
  }
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, dados(p.titulo, p.descricao, p.caminho) + p.conteudo + "\n", "utf8");
  criadas++;
}

console.log(`${criadas} páginas criadas, ${puladas} já existiam (não foram tocadas)`);
