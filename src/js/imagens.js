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

  function aplicar(mapa) {
    if (!mapa) return;

    document.querySelectorAll("[data-img]").forEach(function (el) {
      var registro = mapa[el.getAttribute("data-img")];
      if (!registro || !registro.url) return;

      if (el.tagName === "IMG") {
        if (el.getAttribute("src") === registro.url) return;
        el.setAttribute("src", registro.url);
        el.removeAttribute("srcset");
        return;
      }

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
      try {
        sessionStorage.setItem(CACHE, JSON.stringify({ em: Date.now(), mapa: dados.imagens }));
      } catch (e) {}
    })
    .catch(function () {});

  /* ---------- Textos editáveis pelo painel ----------
     Mesma ideia das fotos: data-campo="cnpj" e afins. O valor do
     build fica no HTML (bom para busca e para quem está sem JS) e
     só é substituído se existir algo salvo. */
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
})();
