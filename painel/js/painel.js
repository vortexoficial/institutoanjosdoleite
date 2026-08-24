/* ============================================================
   Painel do Instituto Anjos do Leite

   Quatro seções: resumo, fotos, projetos e informações. Tudo é
   salvo item a item, no próprio botão. Não existe "salvar tudo":
   um formulário único apagaria o que não estivesse na tela e
   travaria inteiro por causa de um campo inválido.
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

  var CAMPOS = [
    { campo: "cnpj", rotulo: "CNPJ", dica: "Aparece no rodapé e na área de transparência.", tipo: "text" },
    { campo: "whatsapp", rotulo: "WhatsApp", dica: "Formato (13) 99999-9999. Atualiza o botão flutuante e o rodapé.", tipo: "text" },
    { campo: "email", rotulo: "E-mail institucional", dica: "Usado nos canais de contato.", tipo: "text" },
    { campo: "endereco", rotulo: "Endereço da sede", dica: "Deixe em branco enquanto não houver sede fixa.", tipo: "text" },
    { campo: "hero-texto", rotulo: "Texto do banner", dica: "O parágrafo abaixo do título na página inicial.", tipo: "textarea" },
    { campo: "fundadora-cargo", rotulo: "Fundadora: cargo", dica: "Aparece acima do nome, na página da fundadora.", tipo: "text" },
    { campo: "fundadora-nome", rotulo: "Fundadora: nome", dica: "Título da página da fundadora.", tipo: "text" },
    { campo: "fundadora-resumo", rotulo: "Fundadora: resumo", dica: "A frase logo abaixo do nome.", tipo: "textarea" },
    { campo: "fundadora-bio", rotulo: "Fundadora: biografia", dica: "Deixe uma linha em branco entre um parágrafo e outro.", tipo: "textarea" },
    { campo: "fundadora-citacao", rotulo: "Fundadora: frase de fechamento", dica: "A citação em destaque no fim da página.", tipo: "textarea" }
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

  /* aoMudar: o que refazer depois de enviar ou remover. A lista de
     fotos remonta sozinha; a galeria de um projeto precisa remontar
     ela mesma, porque vive em outra tela. */
  function cartaoDeFoto(espaco, registro, aoMudar) {
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
          return carregarFotos().then(function () { if (aoMudar) aoMudar(); });
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
            return carregarFotos().then(function () { if (aoMudar) aoMudar(); });
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
     ============================================================ */

  var editando = null;   // slug do projeto aberto no editor

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

      var acoes = document.createElement("div");
      acoes.className = "registro__acoes";

      var editar = document.createElement("button");
      editar.type = "button";
      editar.className = "botao botao--claro";
      editar.appendChild(icone("pencil"));
      editar.appendChild(document.createTextNode("Editar"));
      editar.addEventListener("click", function () { abrirEditor(projeto); });

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

      linha.appendChild(texto);
      linha.appendChild(acoes);
      destino.appendChild(linha);
    });
  }

  /* ---------- Galeria de um projeto (até 5 fotos) ----------
     As chaves seguem o slug: projeto-<slug>-1 até -5. Por isso a
     galeria só abre depois que o projeto foi salvo: antes disso o
     slug ainda não existe e a foto ficaria órfã. */
  var LIMITE_GALERIA = 5;

  function chaveGaleria(slug, numero) {
    return "projeto-" + slug + "-" + numero;
  }

  /* As fotos do projeto ficam aqui, e não na aba Fotos: quem cria um
     projeto quer resolver tudo em uma tela só. A capa é escolhida
     entre as fotos enviadas, e não digitada. */
  function montarGaleriaProjeto(slug) {
    var caixa = $("galeriaProjeto");
    var grade = $("galeriaProjetoEspacos");

    if (!slug) {
      caixa.hidden = true;
      return;
    }

    caixa.hidden = false;
    grade.textContent = "";

    var capaAtual = $("projetoImagem").value;

    for (var i = 1; i <= LIMITE_GALERIA; i++) {
      grade.appendChild(cartaoFotoProjeto(slug, i, capaAtual));
    }
  }

  function cartaoFotoProjeto(slug, numero, capaAtual) {
    var chave = chaveGaleria(slug, numero);
    var registro = estado.imagens[chave];
    var temFoto = !!(registro && registro.url);
    var ehCapa = capaAtual === chave;

    var cartao = document.createElement("article");
    cartao.className = "foto-projeto" + (ehCapa ? " foto-projeto--capa" : "");

    var moldura = document.createElement("div");
    moldura.className = "foto-projeto__quadro";

    if (temFoto) {
      var img = document.createElement("img");
      img.src = registro.url;
      img.alt = "Foto " + numero + " do projeto";
      img.loading = "lazy";
      moldura.appendChild(img);
    } else {
      var vazio = document.createElement("span");
      vazio.className = "foto-projeto__vazio";
      vazio.appendChild(icone("image-plus"));
      moldura.appendChild(vazio);
    }

    if (ehCapa) {
      var selo = document.createElement("span");
      selo.className = "foto-projeto__selo";
      selo.appendChild(icone("star"));
      selo.appendChild(document.createTextNode("Capa"));
      moldura.appendChild(selo);
    }

    cartao.appendChild(moldura);

    var acoes = document.createElement("div");
    acoes.className = "foto-projeto__acoes";

    var entrada = document.createElement("input");
    entrada.type = "file";
    entrada.accept = "image/jpeg,image/png,image/webp";
    entrada.hidden = true;

    var enviar = document.createElement("button");
    enviar.type = "button";
    enviar.className = "botao " + (temFoto ? "botao--claro" : "botao--ambar");
    enviar.textContent = temFoto ? "Trocar" : "Enviar";
    enviar.addEventListener("click", function () { entrada.click(); });

    entrada.addEventListener("change", function () {
      var arquivo = entrada.files && entrada.files[0];
      if (!arquivo) return;

      var formulario = new FormData();
      formulario.append("chave", chave);
      formulario.append("arquivo", arquivo);

      enviar.disabled = true;
      enviar.textContent = "Enviando...";

      pedir("/api/imagens", { method: "POST", body: formulario })
        .then(function () {
          /* primeira foto do projeto vira a capa sozinha: é o que a
             pessoa espera, e evita projeto publicado sem capa */
          if (!$("projetoImagem").value) {
            $("projetoImagem").value = chave;
            salvarCapa(chave);
          }
          recado("Foto enviada.");
          return carregarFotos().then(function () { montarGaleriaProjeto(slug); });
        })
        .catch(function (erro) {
          recado(erro.message, true);
          enviar.disabled = false;
          enviar.textContent = temFoto ? "Trocar" : "Enviar";
        });
    });

    acoes.appendChild(enviar);
    acoes.appendChild(entrada);

    if (temFoto && !ehCapa) {
      var usarCapa = document.createElement("button");
      usarCapa.type = "button";
      usarCapa.className = "botao botao--claro";
      usarCapa.appendChild(icone("star"));
      usarCapa.appendChild(document.createTextNode("Capa"));
      usarCapa.addEventListener("click", function () {
        $("projetoImagem").value = chave;
        salvarCapa(chave);
        montarGaleriaProjeto(slug);
      });
      acoes.appendChild(usarCapa);
    }

    if (temFoto) {
      var remover = document.createElement("button");
      remover.type = "button";
      remover.className = "botao botao--texto";
      remover.textContent = "Remover";
      remover.addEventListener("click", function () {
        if (!confirm("Remover a foto " + numero + " deste projeto?")) return;
        pedir("/api/imagens?chave=" + encodeURIComponent(chave), { method: "DELETE" })
          .then(function () {
            if ($("projetoImagem").value === chave) {
              $("projetoImagem").value = "";
              salvarCapa("");
            }
            recado("Foto removida.");
            return carregarFotos().then(function () { montarGaleriaProjeto(slug); });
          })
          .catch(function (erro) { recado(erro.message, true); });
      });
      acoes.appendChild(remover);
    }

    cartao.appendChild(acoes);
    return cartao;
  }

  /* a capa é salva na hora, junto com o resto do projeto que já existe */
  function salvarCapa(chave) {
    if (!editando) return;
    var projeto = estado.projetos.find(function (p) { return p.slug === editando; });
    if (!projeto) return;

    pedir("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: projeto.slug,
        nome: projeto.nome,
        etiqueta: projeto.etiqueta,
        resumo: projeto.resumo,
        texto: projeto.texto,
        acoes: projeto.acoes,
        publicado: projeto.publicado,
        imagem: chave
      })
    })
      .then(function () { return carregarProjetos(); })
      .catch(function (erro) { recado(erro.message, true); });
  }

  function abrirEditor(projeto) {
    editando = projeto ? projeto.slug : null;
    montarGaleriaProjeto(editando);
    $("editorTitulo").textContent = projeto ? "Editando: " + projeto.nome : "Novo projeto";
    $("projetoNome").value = projeto ? projeto.nome || "" : "";
    $("projetoEtiqueta").value = projeto ? projeto.etiqueta || "" : "";
    $("projetoResumo").value = projeto ? projeto.resumo || "" : "";
    $("projetoTexto").value = projeto ? projeto.texto || "" : "";
    $("projetoAcoes").value = projeto && projeto.acoes ? projeto.acoes.join("\n") : "";
    $("projetoImagem").value = projeto ? projeto.imagem || "" : "";
    $("projetoPublicado").checked = projeto ? projeto.publicado !== false : true;
    $("editorProjeto").hidden = false;
    $("editorProjeto").scrollIntoView({ behavior: "smooth", block: "start" });
    $("projetoNome").focus();
  }

  function fecharEditor() {
    editando = null;
    $("editorProjeto").hidden = true;
    $("galeriaProjeto").hidden = true;
  }

  $("novoProjeto").addEventListener("click", function () { abrirEditor(null); });
  $("cancelarProjeto").addEventListener("click", fecharEditor);

  $("editorProjeto").addEventListener("submit", function (e) {
    e.preventDefault();
    var botao = $("salvarProjeto");
    botao.disabled = true;

    var corpo = {
      slug: editando || "",
      nome: $("projetoNome").value,
      etiqueta: $("projetoEtiqueta").value,
      resumo: $("projetoResumo").value,
      texto: $("projetoTexto").value,
      imagem: $("projetoImagem").value,
      publicado: $("projetoPublicado").checked,
      acoes: $("projetoAcoes").value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean)
    };

    pedir("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo)
    })
      .then(function (dados) {
        recado("Projeto salvo.");
        carregarProjetos();

        /* projeto novo: em vez de fechar, abre a galeria com o slug
           que acabou de ser criado, que é o passo seguinte natural */
        if (!editando && dados && dados.projeto) {
          editando = dados.projeto.slug;
          $("editorTitulo").textContent = "Editando: " + dados.projeto.nome;
          montarGaleriaProjeto(editando);
          $("galeriaProjeto").scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          fecharEditor();
        }
      })
      .catch(function (erro) { recado(erro.message, true); })
      .finally(function () { botao.disabled = false; });
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
      if (item.campo === "fundadora-bio") entrada.rows = 10;
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
    carregarFotos();
    carregarProjetos();
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
