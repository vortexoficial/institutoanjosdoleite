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
   "projeto-educacao", "projeto-primeira-infancia"].forEach(function (c) {
    PADRAO[c] = "/assets/img/" + c + ".svg";
  });

  var CAMPOS = [
    { campo: "cnpj", rotulo: "CNPJ", dica: "Aparece no rodapé e na área de transparência.", tipo: "text" },
    { campo: "whatsapp", rotulo: "WhatsApp", dica: "Formato (13) 99999-9999. Atualiza o botão flutuante e o rodapé.", tipo: "text" },
    { campo: "email", rotulo: "E-mail institucional", dica: "Usado na página de contato.", tipo: "text" },
    { campo: "endereco", rotulo: "Endereço da sede", dica: "Deixe em branco enquanto não houver sede fixa.", tipo: "text" },
    { campo: "hero-texto", rotulo: "Texto do banner", dica: "O parágrafo abaixo do título na página inicial.", tipo: "textarea" }
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
    $("painelInformacoes").hidden = aba.dataset.aba !== "informacoes";
  });

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
