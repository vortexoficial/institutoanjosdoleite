/* ============================================================
   Painel do Instituto Anjos do Leite

   Quatro seções: resumo, fotos, projetos e informações. Fotos do
   site e informações são salvas item a item, no próprio botão: um
   formulário único apagaria o que não estivesse na tela e travaria
   inteiro por causa de um campo inválido.

   Projetos são a exceção, e por um motivo: texto e fotos de um
   projeto formam uma coisa só, e as fotos dependem do endereço que
   nasce junto com ele. Por isso vivem numa janela própria, salva de
   uma vez, um projeto por vez.
   ============================================================ */

(function () {
  "use strict";

  var TOKEN = "iadl.painel.token";
  var LATERAL = "iadl.painel.lateral";

  /* ---------- Mapa dos espaços de foto do site ----------
     Para acrescentar um espaço novo: coloque data-img="chave" no
     HTML da página e adicione a chave nesta lista. */
  var GRUPOS = [
    {
      titulo: "Página inicial: banner do topo",
      curto: "Banner do topo",
      ajuda: "As cinco fotos que se alternam no topo da página inicial. Deitadas, bem iluminadas.",
      espacos: [
        { chave: "hero-1", rotulo: "Banner 1", nota: "Atendimento de amamentação" },
        { chave: "hero-2", rotulo: "Banner 2", nota: "Encontro com gestantes" },
        { chave: "hero-3", rotulo: "Banner 3", nota: "Mãe amamentando" },
        { chave: "hero-4", rotulo: "Banner 4", nota: "Hora do Mamaço" },
        { chave: "hero-5", rotulo: "Banner 5", nota: "Ação social na comunidade" }
      ]
    },
    {
      titulo: "Página inicial: seções",
      curto: "Seções da home",
      ajuda: "A faixa larga da nossa história e a foto usada na página da fundadora.",
      espacos: [
        { chave: "historia", rotulo: "Nossa história", nota: "Foto larga, entre o texto e a trajetória" },
        { chave: "fundadora", rotulo: "Fundadora", nota: "Usada se a foto recortada for trocada" }
      ]
    },
    {
      titulo: "Galeria da página inicial",
      curto: "Galeria da home",
      ajuda: "As oito fotos do mural que corre na horizontal, no fim da página inicial.",
      espacos: [
        { chave: "galeria-1", rotulo: "Foto 1", nota: "Atendimento" },
        { chave: "galeria-2", rotulo: "Foto 2", nota: "Hora do Mamaço" },
        { chave: "galeria-3", rotulo: "Foto 3", nota: "Roda de conversa" },
        { chave: "galeria-4", rotulo: "Foto 4", nota: "Formação" },
        { chave: "galeria-5", rotulo: "Foto 5", nota: "Ação social" },
        { chave: "galeria-6", rotulo: "Foto 6", nota: "Homenagem" },
        { chave: "galeria-7", rotulo: "Foto 7", nota: "Congresso" },
        { chave: "galeria-8", rotulo: "Foto 8", nota: "Equipe" }
      ]
    },
    {
      titulo: "Galeria da fundadora",
      curto: "Galeria da fundadora",
      ajuda: "Homenagens, Câmara, CAPEP, entrevistas, podcasts e congressos.",
      espacos: [
        { chave: "galeria-homenagens", rotulo: "Homenagens", nota: "" },
        { chave: "galeria-camara", rotulo: "Câmara Municipal", nota: "" },
        { chave: "galeria-capep", rotulo: "CAPEP", nota: "" },
        { chave: "galeria-mamaco", rotulo: "Hora do Mamaço", nota: "" },
        { chave: "galeria-entrevistas", rotulo: "Entrevistas", nota: "" },
        { chave: "galeria-podcasts", rotulo: "Podcasts", nota: "" },
        { chave: "galeria-congressos", rotulo: "Congressos", nota: "" },
        { chave: "galeria-atendimentos", rotulo: "Atendimentos", nota: "" }
      ]
    },
    {
      titulo: "Parceiros e apoiadores",
      curto: "Parceiros",
      ajuda: "Logos em PNG com fundo transparente ficam melhores.",
      espacos: [
        { chave: "parceiro-1", rotulo: "Parceiro 1", nota: "Logo com fundo transparente (PNG)" },
        { chave: "parceiro-2", rotulo: "Parceiro 2", nota: "" },
        { chave: "parceiro-3", rotulo: "Parceiro 3", nota: "" },
        { chave: "parceiro-4", rotulo: "Parceiro 4", nota: "" },
        { chave: "parceiro-5", rotulo: "Parceiro 5", nota: "" },
        { chave: "parceiro-6", rotulo: "Parceiro 6", nota: "" }
      ]
    }
  ];

  /* Os espaços reservados são regerados por script e o cache de um
     ano do _headers deixaria o desenho antigo na miniatura. O build
     carimba a versão no endereço deste arquivo, então aproveitamos
     o mesmo carimbo aqui. */
  var VERSAO = (function () {
    var script = document.currentScript;
    var marca = script && script.src && script.src.split("?v=")[1];
    return marca ? "?v=" + marca : "";
  })();

  /* Espaços que já têm uma imagem reservada gerada no site */
  var PADRAO = {};
  GRUPOS.forEach(function (grupo) {
    grupo.espacos.forEach(function (espaco) {
      if (espaco.chave.indexOf("parceiro-") === 0) return;   // parceiro não tem arte reservada
      PADRAO[espaco.chave] = "/assets/img/" + espaco.chave + ".svg" + VERSAO;
    });
  });

  var TOTAL_ESPACOS = GRUPOS.reduce(function (soma, g) { return soma + g.espacos.length; }, 0);

  /* Só o que muda com o tempo. O texto do banner e a página da
     fundadora saíram daqui: o conteúdo veio pronto do site do
     Instituto e está escrito no HTML. */
  var CAMPOS = [
    { campo: "cnpj", rotulo: "CNPJ", dica: "Aparece no rodapé e na área de transparência.", tipo: "text" },
    { campo: "whatsapp", rotulo: "WhatsApp", dica: "Formato (13) 99999-9999. Atualiza o botão flutuante e o rodapé.", tipo: "text" },
    { campo: "email", rotulo: "E-mail institucional", dica: "Usado nos canais de contato.", tipo: "text" },
    { campo: "endereco", rotulo: "Endereço da sede", dica: "Deixe em branco enquanto não houver sede fixa.", tipo: "text" }
  ];

  var TITULOS = {
    resumo: "Resumo",
    fotos: "Fotos do site",
    projetos: "Projetos e ações",
    informacoes: "Informações"
  };

  /* ---------- Atalhos ---------- */

  var $ = function (id) { return document.getElementById(id); };
  var token = sessionStorage.getItem(TOKEN) || "";

  /* estado, para o resumo não precisar buscar tudo de novo */
  var estado = { imagens: {}, projetos: [], campos: {} };

  function recado(texto, ehErro) {
    var caixa = $("recado");
    caixa.textContent = texto;
    caixa.className = "recado aparece" + (ehErro ? " erro" : "");
    clearTimeout(caixa._t);
    caixa._t = setTimeout(function () { caixa.className = "recado"; }, 3600);
  }

  function pedir(url, opcoes) {
    opcoes = opcoes || {};
    opcoes.headers = opcoes.headers || {};
    if (token) opcoes.headers.Authorization = "Bearer " + token;
    return fetch(url, opcoes).then(function (r) {
      return r.json().then(function (dados) {
        if (!r.ok) throw new Error(dados.erro || "Não foi possível concluir.");
        return dados;
      });
    });
  }

  function icone(nome) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var uso = document.createElementNS("http://www.w3.org/2000/svg", "use");
    uso.setAttribute("href", "#p-" + nome);
    svg.setAttribute("aria-hidden", "true");
    svg.appendChild(uso);
    return svg;
  }

  /* ============================================================
     LOGIN
     ============================================================ */

  $("formLogin").addEventListener("submit", function (e) {
    e.preventDefault();
    var botao = $("botaoEntrar");
    var aviso = $("avisoLogin");
    aviso.textContent = "";
    botao.disabled = true;
    botao.textContent = "Entrando...";

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha: $("senha").value })
    })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.erro || "Erro"); return d; }); })
      .then(function (dados) {
        token = dados.token;
        sessionStorage.setItem(TOKEN, token);
        abrirPainel();
      })
      .catch(function (erro) { aviso.textContent = erro.message; })
      .finally(function () {
        botao.disabled = false;
        botao.textContent = "Entrar";
      });
  });

  $("botaoSair").addEventListener("click", function () {
    sessionStorage.removeItem(TOKEN);
    location.reload();
  });

  /* ============================================================
     NAVEGAÇÃO
     ============================================================ */

  function trocarAba(nome) {
    ["resumo", "fotos", "projetos", "informacoes"].forEach(function (chave) {
      var secao = $("painel" + chave.charAt(0).toUpperCase() + chave.slice(1));
      if (secao) secao.hidden = chave !== nome;
    });

    document.querySelectorAll("[data-aba]").forEach(function (botao) {
      botao.classList.toggle("ativo", botao.dataset.aba === nome);
    });

    $("tituloSecao").textContent = TITULOS[nome] || "";
    document.querySelector(".area").scrollTo({ top: 0 });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  document.querySelectorAll("[data-aba]").forEach(function (botao) {
    botao.addEventListener("click", function () { trocarAba(botao.dataset.aba); });
  });

  document.querySelectorAll("[data-ir]").forEach(function (botao) {
    botao.addEventListener("click", function () { trocarAba(botao.dataset.ir); });
  });

  /* recolher a barra lateral, com a escolha guardada no navegador */
  var recolher = $("recolher");
  if (localStorage.getItem(LATERAL) === "1") $("telaPainel").classList.add("recolhida");

  recolher.addEventListener("click", function () {
    var app = $("telaPainel");
    var fechada = app.classList.toggle("recolhida");
    localStorage.setItem(LATERAL, fechada ? "1" : "0");
    recolher.querySelector("use").setAttribute("href", fechada ? "#p-panel-left-open" : "#p-panel-left-close");
    recolher.setAttribute("aria-label", fechada ? "Expandir menu" : "Recolher menu");
  });

  /* ============================================================
     RESUMO
     ============================================================ */

  function atualizarResumo() {
    var publicadas = Object.keys(estado.imagens).length;
    var projetosPublicados = estado.projetos.filter(function (p) { return p.publicado !== false; }).length;
    var acoes = estado.projetos.reduce(function (soma, p) {
      return soma + ((p.acoes && p.acoes.length) || 0);
    }, 0);

    document.querySelector("[data-kpi-fotos]").textContent = publicadas;
    document.querySelector("[data-kpi-espacos]").textContent = Math.max(0, TOTAL_ESPACOS - publicadas);
    document.querySelector("[data-kpi-projetos]").textContent = projetosPublicados;
    document.querySelector("[data-kpi-acoes]").textContent = acoes;

    /* contadores da barra lateral */
    var contaFotos = document.querySelector("[data-conta-fotos]");
    var faltando = Math.max(0, TOTAL_ESPACOS - publicadas);
    contaFotos.textContent = faltando;
    contaFotos.hidden = faltando === 0;

    var contaProjetos = document.querySelector("[data-conta-projetos]");
    contaProjetos.textContent = projetosPublicados;
    contaProjetos.hidden = projetosPublicados === 0;

    /* pendências: o que realmente falta para o site sair do provisório */
    var lista = document.querySelector("[data-pendencias]");
    lista.textContent = "";

    var pendencias = [];
    var cnpj = (estado.campos.cnpj || "").trim();

    if (!cnpj || cnpj.indexOf("00.000.000") === 0) {
      pendencias.push("Preencher o CNPJ do Instituto, em Informações.");
    }

    var semBanner = ["hero-1", "hero-2", "hero-3", "hero-4", "hero-5"].filter(function (c) {
      return !estado.imagens[c];
    }).length;
    if (semBanner) {
      pendencias.push("Enviar " + semBanner + " foto(s) do banner da página inicial.");
    }

    var semGaleria = [1, 2, 3, 4, 5, 6, 7, 8].filter(function (n) {
      return !estado.imagens["galeria-" + n];
    }).length;
    if (semGaleria) {
      pendencias.push("Enviar " + semGaleria + " foto(s) da galeria.");
    }

    var semParceiro = [1, 2, 3, 4, 5, 6].every(function (n) { return !estado.imagens["parceiro-" + n]; });
    if (semParceiro) {
      pendencias.push("Enviar as logos dos parceiros e apoiadores.");
    }

    if (!(estado.campos.whatsapp || "").trim()) {
      pendencias.push("Confirmar o WhatsApp do Instituto, em Informações.");
    }

    if (!pendencias.length) {
      var pronto = document.createElement("li");
      pronto.className = "ok";
      pronto.textContent = "Tudo preenchido. O site está com o conteúdo completo.";
      lista.appendChild(pronto);
      return;
    }

    pendencias.forEach(function (texto) {
      var li = document.createElement("li");
      li.textContent = texto;
      lista.appendChild(li);
    });
  }

  /* ============================================================
     FOTOS
     ============================================================ */

  /* Índice de partes do site. Antes eram abas em fila, que no celular
     rolavam para o lado e se confundiam com a barra de progresso.
     Agora cada parte é um cartão: aparecem todas de uma vez, e clicar
     abre só aquela. */
  var albumAberto = null;

  function montarAlbuns(mapa) {
    var destino = $("albuns");
    destino.textContent = "";

    GRUPOS.forEach(function (grupo, indice) {
      var enviadas = grupo.espacos.filter(function (e) { return mapa[e.chave]; }).length;
      var total = grupo.espacos.length;
      var completo = enviadas === total;

      var cartao = document.createElement("button");
      cartao.type = "button";
      cartao.className = "album" + (completo ? " album--completo" : "");

      /* mosaico com as quatro primeiras: dá para reconhecer a parte
         do site de relance, sem ler o título */
      var mosaico = document.createElement("span");
      mosaico.className = "album__mosaico";
      grupo.espacos.slice(0, 4).forEach(function (espaco) {
        var quadro = document.createElement("span");
        quadro.className = "album__quadro";
        var registro = mapa[espaco.chave];
        var url = (registro && registro.url) || PADRAO[espaco.chave];
        if (url) {
          var img = document.createElement("img");
          img.src = url;
          img.alt = "";
          img.loading = "lazy";
          img.addEventListener("error", function () { img.remove(); });
          quadro.appendChild(img);
        }
        mosaico.appendChild(quadro);
      });
      cartao.appendChild(mosaico);

      var corpo = document.createElement("span");
      corpo.className = "album__corpo";

      var titulo = document.createElement("strong");
      titulo.textContent = grupo.curto || grupo.titulo;
      corpo.appendChild(titulo);

      var contagem = document.createElement("span");
      contagem.className = "album__contagem";
      contagem.textContent = completo
        ? "Todas as " + total + " fotos no ar"
        : enviadas + " de " + total + " enviadas";
      corpo.appendChild(contagem);

      var barra = document.createElement("span");
      barra.className = "album__barra";
      var preenche = document.createElement("span");
      preenche.style.width = (total ? Math.round((enviadas / total) * 100) : 0) + "%";
      barra.appendChild(preenche);
      corpo.appendChild(barra);

      cartao.appendChild(corpo);

      var seta = icone("chevron-right");
      seta.classList.add("album__seta");
      cartao.appendChild(seta);

      cartao.addEventListener("click", function () { abrirAlbum(indice); });
      destino.appendChild(cartao);
    });
  }

  function abrirAlbum(indice) {
    albumAberto = indice;
    $("indiceAlbuns").hidden = true;
    $("albumAberto").hidden = false;
    montarEspacos(estado.imagens);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function fecharAlbum() {
    albumAberto = null;
    $("albumAberto").hidden = true;
    $("indiceAlbuns").hidden = false;
    montarAlbuns(estado.imagens);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  $("voltarAlbuns").addEventListener("click", fecharAlbum);

  function montarEspacos(mapa) {
    var grupo = GRUPOS[albumAberto];
    if (!grupo) return;

    var enviadas = grupo.espacos.filter(function (e) { return mapa[e.chave]; }).length;
    var total = grupo.espacos.length;

    $("albumTitulo").textContent = grupo.titulo;
    $("albumAjuda").textContent = grupo.ajuda || "";

    var caixa = $("progressoGrupo");
    caixa.querySelector(".progresso__barra span").style.width =
      (total ? Math.round((enviadas / total) * 100) : 0) + "%";
    caixa.querySelector(".progresso__texto").textContent =
      enviadas === total
        ? "Todas as fotos desta parte já estão no ar."
        : enviadas + " de " + total + " fotos enviadas nesta parte do site.";
    caixa.classList.toggle("completo", enviadas === total);

    var destino = $("grupos");
    destino.textContent = "";

    var grade = document.createElement("div");
    grade.className = "espacos";
    grupo.espacos.forEach(function (espaco) {
      grade.appendChild(cartaoDeFoto(espaco, mapa[espaco.chave]));
    });
    destino.appendChild(grade);
  }

  /* Redesenha a tela de fotos no estado em que ela estiver */
  function montarFotos(mapa) {
    if (albumAberto === null) montarAlbuns(mapa);
    else montarEspacos(mapa);
  }

  function cartaoDeFoto(espaco, registro) {
    var cartao = document.createElement("article");
    cartao.className = "espaco";

    var trocada = !!(registro && registro.url);
    var url = trocada ? registro.url : PADRAO[espaco.chave] || "";

    var moldura = document.createElement("div");
    moldura.className = "espaco__foto";
    if (url) {
      var img = document.createElement("img");
      img.src = url;
      img.alt = espaco.rotulo;
      img.loading = "lazy";
      moldura.appendChild(img);
    }
    var marca = document.createElement("span");
    marca.className = "espaco__marca" + (trocada ? " trocada" : "");
    marca.textContent = trocada ? "no ar" : "sem foto";
    moldura.appendChild(marca);

    var corpo = document.createElement("div");
    corpo.className = "espaco__corpo";

    var nome = document.createElement("strong");
    nome.textContent = espaco.rotulo;
    corpo.appendChild(nome);

    if (espaco.nota) {
      var nota = document.createElement("span");
      nota.textContent = espaco.nota;
      corpo.appendChild(nota);
    }

    var acoes = document.createElement("div");
    acoes.className = "espaco__acoes";

    var entrada = document.createElement("input");
    entrada.type = "file";
    entrada.accept = "image/jpeg,image/png,image/webp";

    var enviar = document.createElement("button");
    enviar.type = "button";
    enviar.className = "botao botao--ambar";
    enviar.appendChild(icone("image-plus"));
    enviar.appendChild(document.createTextNode(trocada ? "Trocar" : "Enviar foto"));
    enviar.addEventListener("click", function () { entrada.click(); });

    entrada.addEventListener("change", function () {
      var arquivo = entrada.files && entrada.files[0];
      if (!arquivo) return;

      var formulario = new FormData();
      formulario.append("chave", espaco.chave);
      formulario.append("arquivo", arquivo);

      enviar.disabled = true;
      enviar.textContent = "Enviando...";

      pedir("/api/imagens", { method: "POST", body: formulario })
        .then(function () {
          recado("Foto publicada: " + espaco.rotulo);
          return carregarFotos();
        })
        .catch(function (erro) {
          recado(erro.message, true);
          enviar.disabled = false;
          enviar.textContent = trocada ? "Trocar" : "Enviar foto";
        });
    });

    acoes.appendChild(enviar);
    acoes.appendChild(entrada);

    if (trocada) {
      var remover = document.createElement("button");
      remover.type = "button";
      remover.className = "botao botao--texto";
      remover.textContent = "Remover";
      remover.addEventListener("click", function () {
        if (!confirm('Remover a foto de "' + espaco.rotulo + '"?')) return;
        pedir("/api/imagens?chave=" + encodeURIComponent(espaco.chave), { method: "DELETE" })
          .then(function () {
            recado("Foto removida: " + espaco.rotulo);
            return carregarFotos();
          })
          .catch(function (erro) { recado(erro.message, true); });
      });
      acoes.appendChild(remover);
    }

    corpo.appendChild(acoes);
    cartao.appendChild(moldura);
    cartao.appendChild(corpo);
    return cartao;
  }

  function carregarFotos() {
    return pedir("/api/imagens")
      .then(function (dados) {
        estado.imagens = dados.imagens || {};
        montarFotos(estado.imagens);
        atualizarResumo();
      })
      .catch(function (erro) { recado(erro.message, true); });
  }

  /* ============================================================
     PROJETOS

     Tudo de um projeto acontece na janela: texto, ações e as até
     cinco fotos. As fotos ficam em espera enquanto a pessoa escolhe
     e só sobem quando ela salva. É o que permite montar a galeria
     já na criação, quando o endereço do projeto ainda não existe.
     ============================================================ */

  var LIMITE_GALERIA = 5;

  var editando = null;    // slug do projeto aberto (null quando é novo)
  var fotos = [];         // as cinco posições da galeria
  var capa = 0;           // posição escolhida como capa (1 a 5), 0 se nenhuma
  var capaLivre = "";     // capa que não veio da galeria (o espaço reservado do build)
  var quemAbriu = null;   // botão que abriu a janela, para devolver o foco

  function chaveGaleria(slug, numero) {
    return "projeto-" + slug + "-" + numero;
  }

  /* mesma regra do servidor, só para mostrar o endereço enquanto digita */
  function criarSlug(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
  }

  function montarProjetos(projetos) {
    var destino = $("listaProjetos");
    destino.textContent = "";

    if (!projetos.length) {
      var vazio = document.createElement("p");
      vazio.className = "vazio";
      vazio.textContent = "Nenhum projeto ainda. Clique em Criar projeto para começar.";
      destino.appendChild(vazio);
      return;
    }

    projetos.forEach(function (projeto) {
      var linha = document.createElement("article");
      linha.className = "registro";

      var dados = document.createElement("div");
      dados.className = "registro__dados";

      /* miniatura da capa, para conferir de relance qual foto vai
         aparecer na lista da página inicial */
      var capaCaixa = document.createElement("div");
      capaCaixa.className = "registro__capa";

      /* mesma ordem de tentativa do site: a foto enviada no painel, o
         espaço reservado com o nome da capa, o do endereço do projeto
         e, se nada existir, um ícone */
      var registro = estado.imagens[projeto.imagem || ""];
      var tentativas = [];
      if (registro && registro.url) tentativas.push(registro.url);
      if (projeto.imagem) tentativas.push("/assets/img/" + projeto.imagem + ".svg" + VERSAO);
      tentativas.push("/assets/img/projeto-" + projeto.slug + ".svg" + VERSAO);

      var passo = 0;
      var mini = document.createElement("img");
      mini.alt = "";
      mini.loading = "lazy";
      mini.addEventListener("error", function () {
        passo += 1;
        if (passo < tentativas.length) {
          mini.src = tentativas[passo];
          return;
        }
        mini.remove();
        capaCaixa.appendChild(icone("image"));
      });
      mini.src = tentativas[0];

      capaCaixa.appendChild(mini);
      dados.appendChild(capaCaixa);

      var texto = document.createElement("div");
      texto.className = "registro__texto";

      var nome = document.createElement("strong");
      nome.textContent = projeto.nome;
      if (projeto.publicado === false) {
        var selo = document.createElement("span");
        selo.className = "selo selo--rascunho";
        selo.textContent = "rascunho";
        nome.appendChild(document.createTextNode(" "));
        nome.appendChild(selo);
      }
      texto.appendChild(nome);

      var detalhe = document.createElement("span");
      detalhe.textContent =
        "/projetos/" + projeto.slug + ".html" +
        (projeto.acoes && projeto.acoes.length ? "  ·  " + projeto.acoes.length + " ação(ões)" : "");
      texto.appendChild(detalhe);

      dados.appendChild(texto);

      var acoes = document.createElement("div");
      acoes.className = "registro__acoes";

      var editar = document.createElement("button");
      editar.type = "button";
      editar.className = "botao botao--claro";
      editar.appendChild(icone("pencil"));
      editar.appendChild(document.createTextNode("Editar"));
      editar.addEventListener("click", function () { abrirJanela(projeto); });

      var remover = document.createElement("button");
      remover.type = "button";
      remover.className = "botao botao--texto";
      remover.textContent = "Excluir";
      remover.addEventListener("click", function () {
        if (!confirm('Excluir o projeto "' + projeto.nome + '"? A página dele sai do ar.')) return;
        pedir("/api/projetos?slug=" + encodeURIComponent(projeto.slug), { method: "DELETE" })
          .then(function () {
            recado("Projeto excluído.");
            carregarProjetos();
          })
          .catch(function (erro) { recado(erro.message, true); });
      });

      acoes.appendChild(editar);
      acoes.appendChild(remover);

      linha.appendChild(dados);
      linha.appendChild(acoes);
      destino.appendChild(linha);
    });
  }

  /* ---------- Galeria dentro da janela ---------- */

  function prepararFotos(slug) {
    liberarPrevias();
    fotos = [];
    for (var i = 1; i <= LIMITE_GALERIA; i++) {
      var registro = slug ? estado.imagens[chaveGaleria(slug, i)] : null;
      fotos.push({
        numero: i,
        url: (registro && registro.url) || "",   // o que já está no ar
        arquivo: null,                           // escolhido agora, ainda não enviado
        previa: "",
        remover: false
      });
    }
  }

  function liberarPrevias() {
    fotos.forEach(function (foto) {
      if (foto.previa) URL.revokeObjectURL(foto.previa);
    });
  }

  function temPendencia() {
    return fotos.some(function (foto) { return foto.arquivo || foto.remover; });
  }

  function montarGaleria() {
    var destino = $("galeriaProjetoEspacos");
    destino.textContent = "";
    fotos.forEach(function (foto) { destino.appendChild(cartaoFoto(foto)); });
  }

  function cartaoFoto(foto) {
    var mostra = foto.remover ? "" : (foto.previa || foto.url);
    var ehCapa = !!mostra && capa === foto.numero;

    var cartao = document.createElement("div");
    cartao.className =
      "foto-projeto" + (mostra ? " foto-projeto--cheia" : "") + (ehCapa ? " foto-projeto--capa" : "");

    var entrada = document.createElement("input");
    entrada.type = "file";
    entrada.accept = "image/jpeg,image/png,image/webp";
    entrada.hidden = true;
    entrada.addEventListener("change", function () {
      var arquivo = entrada.files && entrada.files[0];
      if (!arquivo) return;
      if (foto.previa) URL.revokeObjectURL(foto.previa);
      foto.arquivo = arquivo;
      foto.previa = URL.createObjectURL(arquivo);
      foto.remover = false;
      if (!capa) capa = foto.numero;   // a primeira foto vira capa sozinha
      montarGaleria();
    });

    var quadro = document.createElement("button");
    quadro.type = "button";
    quadro.className = "foto-projeto__quadro";
    quadro.setAttribute("aria-label", (mostra ? "Trocar" : "Escolher") + " a foto " + foto.numero);
    quadro.addEventListener("click", function () { entrada.click(); });

    if (mostra) {
      var img = document.createElement("img");
      img.src = mostra;
      img.alt = "";
      quadro.appendChild(img);
    } else {
      var vazio = document.createElement("span");
      vazio.className = "foto-projeto__vazio";
      vazio.appendChild(icone("image-plus"));
      var rotulo = document.createElement("span");
      rotulo.textContent = "Foto " + foto.numero;
      vazio.appendChild(rotulo);
      quadro.appendChild(vazio);
    }

    if (ehCapa) {
      var selo = document.createElement("span");
      selo.className = "foto-projeto__selo";
      selo.appendChild(icone("star"));
      selo.appendChild(document.createTextNode("Capa"));
      quadro.appendChild(selo);
    } else if (mostra && foto.arquivo) {
      var espera = document.createElement("span");
      espera.className = "foto-projeto__selo foto-projeto__selo--espera";
      espera.textContent = "nova";
      quadro.appendChild(espera);
    }

    cartao.appendChild(quadro);
    cartao.appendChild(entrada);

    if (mostra) {
      var acoes = document.createElement("div");
      acoes.className = "foto-projeto__acoes";

      var marcar = document.createElement("button");
      marcar.type = "button";
      marcar.className = "foto-projeto__botao foto-projeto__botao--capa" + (ehCapa ? " ativo" : "");
      marcar.setAttribute("aria-label", "Usar a foto " + foto.numero + " como capa");
      marcar.setAttribute("title", "Usar como capa");
      marcar.appendChild(icone("star"));
      marcar.addEventListener("click", function () {
        capa = foto.numero;
        capaLivre = "";
        montarGaleria();
      });

      var tirar = document.createElement("button");
      tirar.type = "button";
      tirar.className = "foto-projeto__botao foto-projeto__botao--remover";
      tirar.setAttribute("aria-label", "Tirar a foto " + foto.numero);
      tirar.setAttribute("title", "Tirar esta foto");
      tirar.appendChild(icone("trash-2"));
      tirar.addEventListener("click", function () {
        if (foto.previa) {
          URL.revokeObjectURL(foto.previa);
          foto.previa = "";
        }
        foto.arquivo = null;
        if (foto.url) foto.remover = true;   // já está no ar: sai quando salvar
        if (capa === foto.numero) capa = 0;
        montarGaleria();
      });

      acoes.appendChild(marcar);
      acoes.appendChild(tirar);
      cartao.appendChild(acoes);
    }

    return cartao;
  }

  /* ---------- Abrir e fechar a janela ---------- */

  function mostrarEndereco() {
    var slug = editando || criarSlug($("projetoNome").value);
    $("editorEndereco").textContent = slug ? "/projetos/" + slug + ".html" : "";
  }

  function abrirJanela(projeto) {
    quemAbriu = document.activeElement;
    editando = projeto ? projeto.slug : null;
    capa = 0;
    capaLivre = "";

    $("editorTitulo").textContent = projeto ? projeto.nome : "Novo projeto";
    $("projetoNome").value = projeto ? projeto.nome || "" : "";
    $("projetoEtiqueta").value = projeto ? projeto.etiqueta || "" : "";
    $("projetoResumo").value = projeto ? projeto.resumo || "" : "";
    $("projetoTexto").value = projeto ? projeto.texto || "" : "";
    $("projetoAcoes").value = projeto && projeto.acoes ? projeto.acoes.join("\n") : "";
    $("projetoPublicado").checked = projeto ? projeto.publicado !== false : true;

    prepararFotos(editando);

    /* de onde vem a capa: de uma das cinco posições da galeria ou do
       espaço reservado que os projetos de origem já traziam */
    if (projeto && projeto.imagem) {
      capaLivre = projeto.imagem;
      for (var i = 1; i <= LIMITE_GALERIA; i++) {
        if (editando && projeto.imagem === chaveGaleria(editando, i)) {
          capa = i;
          capaLivre = "";
          break;
        }
      }
    }

    montarGaleria();
    mostrarEndereco();

    $("janelaProjeto").hidden = false;
    document.body.classList.add("travado");
    $("janelaProjeto").querySelector(".janela__corpo").scrollTop = 0;
    setTimeout(function () { $("projetoNome").focus(); }, 60);
  }

  function fecharJanela(perguntar) {
    if (perguntar && temPendencia() &&
        !confirm("Sair sem salvar? As fotos escolhidas agora não serão enviadas.")) return;

    liberarPrevias();
    fotos = [];
    editando = null;
    capa = 0;
    capaLivre = "";

    $("janelaProjeto").hidden = true;
    document.body.classList.remove("travado");

    if (quemAbriu && quemAbriu.focus) quemAbriu.focus();
    quemAbriu = null;
  }

  $("novoProjeto").addEventListener("click", function () { abrirJanela(null); });
  $("cancelarProjeto").addEventListener("click", function () { fecharJanela(true); });
  $("fecharJanela").addEventListener("click", function () { fecharJanela(true); });
  $("projetoNome").addEventListener("input", mostrarEndereco);

  document.querySelector("[data-fechar-janela]").addEventListener("click", function () {
    fecharJanela(true);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("janelaProjeto").hidden) fecharJanela(true);
  });

  /* ---------- Salvar ---------- */

  /* a chave da capa depende do slug, que só existe depois de o
     projeto nascer: por isso ela é montada na hora de salvar */
  function chaveDaCapa(slug) {
    if (capa) {
      var foto = fotos[capa - 1];
      if (foto && !foto.remover && (foto.arquivo || foto.url)) return chaveGaleria(slug, capa);
    }
    return capaLivre;
  }

  /* uma foto por vez, em fila: cinco envios ao mesmo tempo derrubam
     o limite de tamanho da requisição em conexões lentas */
  function enviarFotos(slug) {
    var fila = Promise.resolve();

    fotos.forEach(function (foto) {
      var chave = chaveGaleria(slug, foto.numero);

      if (foto.arquivo) {
        fila = fila.then(function () {
          var formulario = new FormData();
          formulario.append("chave", chave);
          formulario.append("arquivo", foto.arquivo);
          return pedir("/api/imagens", { method: "POST", body: formulario });
        });
      } else if (foto.remover && foto.url) {
        fila = fila.then(function () {
          return pedir("/api/imagens?chave=" + encodeURIComponent(chave), { method: "DELETE" });
        });
      }
    });

    return fila;
  }

  function ajustarCapa(slug, salvo) {
    var chave = chaveDaCapa(slug);
    if (!salvo || salvo.imagem === chave) return Promise.resolve();

    return pedir("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug,
        nome: salvo.nome,
        etiqueta: salvo.etiqueta,
        resumo: salvo.resumo,
        texto: salvo.texto,
        acoes: salvo.acoes,
        publicado: salvo.publicado,
        imagem: chave
      })
    });
  }

  $("editorProjeto").addEventListener("submit", function (e) {
    e.preventDefault();

    var botao = $("salvarProjeto");
    var rotulo = $("salvarTexto");
    botao.disabled = true;
    rotulo.textContent = "Salvando...";

    var corpo = {
      slug: editando || "",
      nome: $("projetoNome").value,
      etiqueta: $("projetoEtiqueta").value,
      resumo: $("projetoResumo").value,
      texto: $("projetoTexto").value,
      publicado: $("projetoPublicado").checked,
      acoes: $("projetoAcoes").value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean),
      /* projeto novo ainda não tem endereço: a capa entra no segundo
         passo, quando o slug já existe */
      imagem: editando ? chaveDaCapa(editando) : capaLivre
    };

    var slugFinal = "";

    pedir("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo)
    })
      .then(function (dados) {
        var salvo = dados && dados.projeto;
        slugFinal = (salvo && salvo.slug) || editando;
        if (fotos.some(function (f) { return f.arquivo || f.remover; })) {
          rotulo.textContent = "Enviando fotos...";
        }
        return enviarFotos(slugFinal).then(function () { return ajustarCapa(slugFinal, salvo); });
      })
      .then(function () {
        recado("Projeto salvo.");
        fecharJanela(false);
        return carregarFotos().then(carregarProjetos);
      })
      .catch(function (erro) {
        recado(erro.message, true);
        /* o projeto pode ter sido salvo e a foto não: a galeria volta
           a mostrar o que realmente está no ar, sem fechar a janela */
        if (slugFinal) {
          carregarFotos().then(function () {
            editando = slugFinal;
            prepararFotos(slugFinal);
            montarGaleria();
          });
        }
      })
      .finally(function () {
        botao.disabled = false;
        rotulo.textContent = "Salvar projeto";
      });
  });

  function carregarProjetos() {
    return pedir("/api/projetos")
      .then(function (dados) {
        estado.projetos = dados.projetos || [];
        montarProjetos(estado.projetos);
        atualizarResumo();
      })
      .catch(function (erro) { recado(erro.message, true); });
  }

  /* ============================================================
     INFORMAÇÕES
     ============================================================ */

  function montarCampos(valores) {
    var destino = $("campos");
    destino.textContent = "";

    CAMPOS.forEach(function (item) {
      var bloco = document.createElement("div");
      bloco.className = "campo";

      var rotulo = document.createElement("label");
      rotulo.textContent = item.rotulo;
      rotulo.htmlFor = "campo-" + item.campo;

      var dica = document.createElement("span");
      dica.className = "dica";
      dica.textContent = item.dica;

      var linha = document.createElement("div");
      linha.className = "linha";

      var entrada = document.createElement(item.tipo === "textarea" ? "textarea" : "input");
      entrada.id = "campo-" + item.campo;
      if (item.tipo !== "textarea") entrada.type = "text";
      entrada.value = valores[item.campo] || "";

      var salvar = document.createElement("button");
      salvar.type = "button";
      salvar.className = "botao botao--principal";
      salvar.appendChild(icone("save"));
      salvar.appendChild(document.createTextNode("Salvar"));
      salvar.addEventListener("click", function () {
        salvar.disabled = true;
        pedir("/api/conteudo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campo: item.campo, valor: entrada.value })
        })
          .then(function () {
            estado.campos[item.campo] = entrada.value;
            atualizarResumo();
            recado(item.rotulo + " salvo.");
          })
          .catch(function (erro) { recado(erro.message, true); })
          .finally(function () { salvar.disabled = false; });
      });

      linha.appendChild(entrada);
      linha.appendChild(salvar);

      bloco.appendChild(rotulo);
      bloco.appendChild(dica);
      bloco.appendChild(linha);
      destino.appendChild(bloco);
    });
  }

  function carregarCampos() {
    return pedir("/api/conteudo")
      .then(function (dados) {
        estado.campos = dados.campos || {};
        montarCampos(estado.campos);
        atualizarResumo();
      })
      .catch(function () { montarCampos({}); });
  }

  /* ============================================================
     INÍCIO
     ============================================================ */

  function abrirPainel() {
    $("telaLogin").hidden = true;
    $("telaPainel").hidden = false;
    trocarAba("resumo");
    /* as fotos entram antes dos projetos: a lista usa o mapa de
       imagens para montar a miniatura da capa */
    carregarFotos().then(carregarProjetos);
    carregarCampos();
  }

  if (token) {
    // confere se a sessão ainda vale antes de mostrar o painel
    fetch("/api/sessao", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        if (r.ok) return abrirPainel();
        sessionStorage.removeItem(TOKEN);
        token = "";
      })
      .catch(function () {});
  }
})();
