/* ============================================================
   Aplica as fotos trocadas no painel.

   Cada espaço de foto no site tem data-img="chave". O painel envia
   um arquivo para essa chave e o site passa a mostrá-lo, sem
   ninguém tocar em código.

   Se a chamada falhar (sem rede, painel fora do ar), a página
   simplesmente continua com os espaços reservados do build.
   ============================================================ */

(function () {
  "use strict";

  var CACHE = "iadl.imagens";
  var VALIDADE = 5 * 60 * 1000; // 5 minutos

  /* último mapa de fotos conhecido. A lista de projetos precisa dele
     para montar a capa certa: a capa pode ser uma foto enviada no
     painel, e não o espaço reservado do build. */
  var mapaAtual = {};

  function aplicar(mapa) {
    if (!mapa) return;
    mapaAtual = mapa;

    document.querySelectorAll("[data-img]").forEach(function (el) {
      var registro = mapa[el.getAttribute("data-img")];

      if (el.tagName === "IMG") {
        // guarda o espaço reservado original na primeira passada
        if (!el.dataset.original) el.dataset.original = el.getAttribute("src") || "";

        // foto removida no painel: volta ao espaço reservado, mesmo
        // que a versão anterior já tenha sido aplicada pelo cache
        if (!registro || !registro.url) {
          if (el.dataset.original && el.getAttribute("src") !== el.dataset.original) {
            el.setAttribute("src", el.dataset.original);
          }
          return;
        }

        if (el.getAttribute("src") === registro.url) return;
        el.setAttribute("src", registro.url);
        el.removeAttribute("srcset");
        return;
      }

      if (!registro || !registro.url) return;

      // Espaços que não são <img> (logo de parceiro, por exemplo):
      // o conteúdo de texto dá lugar à imagem enviada.
      var dentro = el.querySelector("img");
      if (!dentro) {
        dentro = document.createElement("img");
        dentro.alt = el.getAttribute("data-alt") || "";
        dentro.loading = "lazy";
        el.textContent = "";
        el.appendChild(dentro);
        el.classList.add("tem-imagem");
      }
      if (dentro.getAttribute("src") !== registro.url) dentro.setAttribute("src", registro.url);
    });
  }

  // 1. o que já está em cache entra na hora, sem piscar
  try {
    var salvo = JSON.parse(sessionStorage.getItem(CACHE) || "null");
    if (salvo && Date.now() - salvo.em < VALIDADE) aplicar(salvo.mapa);
  } catch (e) {}

  // 2. e a versão atual é buscada em segundo plano
  fetch("/api/imagens")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (dados) {
      if (!dados || !dados.imagens) return;
      aplicar(dados.imagens);
      montarGaleriaDoProjeto(dados.imagens);
      try {
        sessionStorage.setItem(CACHE, JSON.stringify({ em: Date.now(), mapa: dados.imagens }));
      } catch (e) {}
    })
    .catch(function () {});

  /* ---------- Galeria de um projeto ----------
     As fotos seguem a chave projeto-<slug>-1 até -5, enviadas no
     painel. Se nenhuma existir, o bloco continua escondido. */
  function montarGaleriaDoProjeto(mapa) {
    var pagina = document.querySelector("[data-projeto-slug]");
    var grade = document.querySelector("[data-projeto-galeria]");
    if (!pagina || !grade) return;

    var slug = pagina.getAttribute("data-projeto-slug");
    var fotos = [];

    for (var i = 1; i <= 5; i++) {
      var registro = mapa["projeto-" + slug + "-" + i];
      if (registro && registro.url) fotos.push(registro.url);
    }
    if (!fotos.length) return;

    grade.textContent = "";
    fotos.forEach(function (url, indice) {
      var figura = document.createElement("figure");
      figura.className = "projeto-galeria__item";

      var img = document.createElement("img");
      img.src = url;
      img.alt = "Foto " + (indice + 1) + " do projeto";
      img.loading = "lazy";

      figura.appendChild(img);
      grade.appendChild(figura);
    });

    var caixa = document.querySelector("[data-projeto-galeria-caixa]");
    if (caixa) caixa.hidden = false;
  }

  /* ---------- Dados do Instituto editáveis pelo painel ----------
     Mesma ideia das fotos: data-campo="cnpj" e afins. O valor do
     build fica no HTML (bom para busca e para quem está sem JS) e
     só é substituído se existir algo salvo.

     São só CNPJ, WhatsApp, e-mail e endereço: os textos do site
     vieram prontos do Instituto e ficam escritos no HTML. */
  fetch("/api/conteudo")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (dados) {
      if (!dados || !dados.campos) return;

      document.querySelectorAll("[data-campo]").forEach(function (el) {
        var valor = dados.campos[el.getAttribute("data-campo")];
        if (typeof valor !== "string" || !valor.trim()) return;
        el.textContent = valor;
        if (el.tagName === "A" && el.getAttribute("data-campo") === "whatsapp") {
          el.setAttribute("href", "https://wa.me/55" + valor.replace(/\D/g, ""));
        }
      });
    })
    .catch(function () {});

  /* ---------- Projetos criados no painel ----------
     A lista da página inicial e o texto de cada página de projeto
     vêm do painel quando existirem. Sem painel (ou sem nada salvo),
     ficam valendo os projetos escritos no HTML. */
  fetch("/api/projetos")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (dados) {
      if (!dados || !Array.isArray(dados.projetos) || !dados.projetos.length) return;
      var projetos = dados.projetos.filter(function (p) { return p.publicado !== false; });
      if (!projetos.length) return;

      aplicarNaPagina(projetos);
      aplicarNaLista(projetos);
    })
    .catch(function () {});

  /* página de um projeto: sobrepõe o que estiver salvo */
  function aplicarNaPagina(projetos) {
    var alvo = document.querySelector("[data-projeto-slug]");
    if (!alvo) return;

    var slug = alvo.getAttribute("data-projeto-slug");
    var projeto = projetos.find(function (p) { return p.slug === slug; });
    if (!projeto) return;

    var nome = document.querySelector("[data-projeto-nome]");
    var etiqueta = document.querySelector("[data-projeto-etiqueta]");
    var resumo = document.querySelector("[data-projeto-resumo]");
    var texto = document.querySelector("[data-projeto-texto]");
    var acoes = document.querySelector("[data-projeto-acoes]");

    if (nome && projeto.nome) { nome.textContent = projeto.nome; document.title = projeto.nome + " | Instituto Anjos do Leite"; }
    if (etiqueta && projeto.etiqueta) etiqueta.textContent = projeto.etiqueta;
    if (resumo && projeto.resumo) resumo.textContent = projeto.resumo;

    if (texto && projeto.texto) {
      texto.textContent = "";
      projeto.texto.split(/\n{2,}/).forEach(function (trecho) {
        if (!trecho.trim()) return;
        var p = document.createElement("p");
        p.textContent = trecho.trim();
        texto.appendChild(p);
      });
    }

    if (acoes && projeto.acoes && projeto.acoes.length) {
      acoes.textContent = "";
      projeto.acoes.forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        acoes.appendChild(li);
      });
      var caixa = acoes.closest("[data-projeto-acoes-caixa]");
      if (caixa) caixa.hidden = false;
    }
  }

  /* lista de projetos da página inicial */
  function aplicarNaLista(projetos) {
    var lista = document.querySelector("[data-lista-projetos]");
    if (!lista) return;

    var modelo = lista.querySelector(".projeto");
    if (!modelo) return;

    var molde = modelo.cloneNode(true);

    /* O GSAP já criou os gatilhos de entrada para os cards que vieram
       no HTML. Estes aqui são novos: se mantivessem data-anima, o CSS
       os deixaria invisíveis e nenhuma animação viria revelá-los.
       Foi o que apagou a seção de projetos em produção. */
    molde.removeAttribute("data-anima");
    molde.style.opacity = "";
    molde.style.transform = "";
    molde.classList.add("projeto--entra");

    lista.textContent = "";

    projetos.forEach(function (projeto) {
      var card = molde.cloneNode(true);

      var img = card.querySelector("img");
      if (img) {
        /* a capa pode ser uma foto enviada no painel (projeto-slug-2)
           ou o espaço reservado do build (projeto-slug). Se nem um nem
           outro existir, cai num espaço genérico em vez de quebrar. */
        var chave = projeto.imagem || "projeto-" + projeto.slug;
        var registro = mapaAtual[chave];

        /* ordem de tentativa até alguma imagem carregar: a foto
           enviada, o espaço reservado com o nome da capa, o do slug e,
           por último, o genérico. Projeto criado no painel não tem
           espaço reservado próprio, e sem essa cadeia ficava quebrado. */
        var tentativas = [];
        if (registro && registro.url) tentativas.push(registro.url);
        tentativas.push("/assets/img/" + chave + ".svg");
        tentativas.push("/assets/img/projeto-" + projeto.slug + ".svg");
        tentativas.push("/assets/img/projeto-generico.svg");

        var passo = 0;
        img.setAttribute("data-img", chave);
        img.dataset.original = tentativas[1];
        img.setAttribute("alt", projeto.nome || "");
        img.addEventListener("error", function () {
          passo += 1;
          if (passo < tentativas.length) img.setAttribute("src", tentativas[passo]);
        });
        img.setAttribute("src", tentativas[0]);
      }

      var etiqueta = card.querySelector(".projeto__etiqueta");
      if (etiqueta) etiqueta.textContent = projeto.etiqueta || "Projeto";

      var titulo = card.querySelector("h3");
      if (titulo) titulo.textContent = projeto.nome || "";

      var texto = card.querySelector("p");
      if (texto) texto.textContent = projeto.resumo || "";

      var link = card.querySelector("a");
      if (link) link.setAttribute("href", "/projetos/" + projeto.slug + ".html");

      lista.appendChild(card);
    });
  }
})();
