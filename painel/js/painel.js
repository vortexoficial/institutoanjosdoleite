/* ============================================================
   Painel do Instituto Anjos do Leite

   Duas tarefas, e só isso: trocar as fotos do site e ajustar as
   informações institucionais. Cada item é salvo sozinho, na hora,
   no seu próprio botão.
   ============================================================ */

(function () {
  "use strict";

  var TOKEN = "iadl.painel.token";

  /* ---------- Mapa dos espaços de foto do site ----------
     Para acrescentar um espaço novo: coloque data-img="chave" no
     HTML da página e adicione a chave nesta lista. */
  var GRUPOS = [
    {
      titulo: "Página inicial: banner do topo",
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
      espacos: [
        { chave: "historia", rotulo: "Nossa história", nota: "Foto vertical, ao lado do texto" },
        { chave: "fundadora", rotulo: "Fundadora", nota: "Sandra Abreu (página da fundadora)" }
      ]
    },
    {
      titulo: "Projetos",
      espacos: [
        { chave: "projeto-mae-acolhida", rotulo: "Mãe Acolhida", nota: "" },
        { chave: "projeto-hora-do-mamaco", rotulo: "Hora do Mamaço", nota: "" },
        { chave: "projeto-formacao", rotulo: "Formação de profissionais", nota: "" },
        { chave: "projeto-educacao", rotulo: "Educação em Saúde", nota: "" },
        { chave: "projeto-primeira-infancia", rotulo: "Primeira Infância", nota: "" }
      ]
    },
    {
      titulo: "Galeria da página inicial",
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

  /* Espaços que já vêm com uma imagem reservada no site */
  var PADRAO = {};
  ["hero-1", "hero-2", "hero-3", "hero-4", "hero-5", "historia", "fundadora",
   "projeto-mae-acolhida", "projeto-hora-do-mamaco", "projeto-formacao",
   "projeto-educacao", "projeto-primeira-infancia",
   "galeria-1", "galeria-2", "galeria-3", "galeria-4", "galeria-5", "galeria-6", "galeria-7", "galeria-8", "galeria-homenagens", "galeria-camara", "galeria-capep", "galeria-mamaco", "galeria-entrevistas", "galeria-podcasts", "galeria-congressos", "galeria-atendimentos"].forEach(function (c) {
    PADRAO[c] = "/assets/img/" + c + ".svg";
  });

  var CAMPOS = [
    { campo: "cnpj", rotulo: "CNPJ", dica: "Aparece no rodapé e na área de transparência.", tipo: "text" },
    { campo: "whatsapp", rotulo: "WhatsApp", dica: "Formato (13) 99999-9999. Atualiza o botão flutuante e o rodapé.", tipo: "text" },
    { campo: "email", rotulo: "E-mail institucional", dica: "Usado na página de contato.", tipo: "text" },
    { campo: "endereco", rotulo: "Endereço da sede", dica: "Deixe em branco enquanto não houver sede fixa.", tipo: "text" },
    { campo: "hero-texto", rotulo: "Texto do banner", dica: "O parágrafo abaixo do título na página inicial.", tipo: "textarea" },
    { campo: "fundadora-cargo", rotulo: "Fundadora: cargo", dica: "Aparece acima do nome, na página da fundadora.", tipo: "text" },
    { campo: "fundadora-nome", rotulo: "Fundadora: nome", dica: "Título da página da fundadora.", tipo: "text" },
    { campo: "fundadora-resumo", rotulo: "Fundadora: resumo", dica: "A frase logo abaixo do nome.", tipo: "textarea" },
    { campo: "fundadora-bio", rotulo: "Fundadora: biografia", dica: "Deixe uma linha em branco entre um parágrafo e outro.", tipo: "textarea" },
    { campo: "fundadora-citacao", rotulo: "Fundadora: frase de fechamento", dica: "A citação em destaque no fim da página.", tipo: "textarea" }
  ];

  /* ---------- Atalhos ---------- */

  var $ = function (id) { return document.getElementById(id); };
  var token = sessionStorage.getItem(TOKEN) || "";

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

  /* ---------- Login ---------- */

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

  /* ---------- Abas ---------- */

  $("abas").addEventListener("click", function (e) {
    var aba = e.target.closest(".aba");
    if (!aba) return;
    document.querySelectorAll(".aba").forEach(function (b) { b.classList.remove("ativa"); });
    aba.classList.add("ativa");
    $("painelFotos").hidden = aba.dataset.aba !== "fotos";
    $("painelProjetos").hidden = aba.dataset.aba !== "projetos";
    $("painelInformacoes").hidden = aba.dataset.aba !== "informacoes";
  });

  /* ---------- Projetos ---------- */

  var editando = null;   // slug do projeto aberto no editor

  function montarProjetos(projetos) {
    var destino = $("listaProjetos");
    destino.textContent = "";

    if (!projetos.length) {
      var vazio = document.createElement("p");
      vazio.className = "vazio";
      vazio.textContent =
        "Nenhum projeto salvo ainda. Enquanto isso, o site mostra os cinco projetos escritos na criação do site.";
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
      texto.appendChild(nome);

      var detalhe = document.createElement("span");
      detalhe.textContent =
        "/projetos/" + projeto.slug + ".html" +
        (projeto.publicado === false ? "  ·  não publicado" : "") +
        (projeto.acoes && projeto.acoes.length ? "  ·  " + projeto.acoes.length + " ação(ões)" : "");
      texto.appendChild(detalhe);

      var acoes = document.createElement("div");
      acoes.className = "registro__acoes";

      var editar = document.createElement("button");
      editar.type = "button";
      editar.className = "botao botao--claro";
      editar.textContent = "Editar";
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

  function abrirEditor(projeto) {
    editando = projeto ? projeto.slug : null;
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
  }

  $("novoProjeto").addEventListener("click", function () { abrirEditor(null); });
  $("cancelarProjeto").addEventListener("click", fecharEditor);

  $("editorProjeto").addEventListener("submit", function (e) {
    e.preventDefault();
    var botao = $("salvarProjeto");
    botao.disabled = true;
    botao.textContent = "Salvando...";

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
      .then(function () {
        recado("Projeto salvo.");
        fecharEditor();
        carregarProjetos();
      })
      .catch(function (erro) { recado(erro.message, true); })
      .finally(function () {
        botao.disabled = false;
        botao.textContent = "Salvar projeto";
      });
  });

  function carregarProjetos() {
    return pedir("/api/projetos")
      .then(function (dados) { montarProjetos(dados.projetos || []); })
      .catch(function (erro) { recado(erro.message, true); });
  }

  /* ---------- Fotos ---------- */

  function montarFotos(mapa) {
    var destino = $("grupos");
    destino.textContent = "";

    GRUPOS.forEach(function (grupo) {
      var bloco = document.createElement("section");
      bloco.className = "grupo";

      var titulo = document.createElement("h3");
      titulo.textContent = grupo.titulo;
      bloco.appendChild(titulo);

      var grade = document.createElement("div");
      grade.className = "espacos";

      grupo.espacos.forEach(function (espaco) {
        grade.appendChild(cartaoDeFoto(espaco, mapa[espaco.chave]));
      });

      bloco.appendChild(grade);
      destino.appendChild(bloco);
    });
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
    marca.textContent = trocada ? "foto publicada" : "espaço reservado";
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
    enviar.textContent = trocada ? "Trocar foto" : "Enviar foto";
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
          carregarFotos();
        })
        .catch(function (erro) {
          recado(erro.message, true);
          enviar.disabled = false;
          enviar.textContent = trocada ? "Trocar foto" : "Enviar foto";
        });
    });

    acoes.appendChild(enviar);
    acoes.appendChild(entrada);

    if (trocada) {
      var remover = document.createElement("button");
      remover.type = "button";
      remover.className = "botao botao--texto";
      remover.textContent = "Voltar ao padrão";
      remover.addEventListener("click", function () {
        if (!confirm("Remover a foto de \"" + espaco.rotulo + "\" e voltar ao espaço reservado?")) return;
        pedir("/api/imagens?chave=" + encodeURIComponent(espaco.chave), { method: "DELETE" })
          .then(function () {
            recado("Foto removida: " + espaco.rotulo);
            carregarFotos();
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
      .then(function (dados) { montarFotos(dados.imagens || {}); })
      .catch(function (erro) { recado(erro.message, true); });
  }

  /* ---------- Informações ---------- */

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
      salvar.textContent = "Salvar";
      salvar.addEventListener("click", function () {
        salvar.disabled = true;
        salvar.textContent = "Salvando...";
        pedir("/api/conteudo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campo: item.campo, valor: entrada.value })
        })
          .then(function () { recado(item.rotulo + " salvo."); })
          .catch(function (erro) { recado(erro.message, true); })
          .finally(function () {
            salvar.disabled = false;
            salvar.textContent = "Salvar";
          });
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
      .then(function (dados) { montarCampos(dados.campos || {}); })
      .catch(function () { montarCampos({}); });
  }

  /* ---------- Início ---------- */

  function abrirPainel() {
    $("telaLogin").hidden = true;
    $("telaPainel").hidden = false;
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
