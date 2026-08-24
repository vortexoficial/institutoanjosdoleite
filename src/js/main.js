/* ============================================================
   INSTITUTO ANJOS DO LEITE
   Interações e animações (GSAP 3.13 + ScrollTrigger + SplitText)

   Princípios deste arquivo:
   1. O site funciona sem JavaScript e sem GSAP. As animações são
      um acabamento, nunca um requisito para ler o conteúdo.
   2. Quem pede menos movimento no sistema (prefers-reduced-motion)
      recebe a página pronta, sem animação nenhuma.
   3. Nada de altura ou largura calculada em pixel aqui: o layout é
      do CSS, o JavaScript só anima.
   ============================================================ */

(function () {
  "use strict";

  var raiz = document.documentElement;
  var menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temGsap = typeof window.gsap !== "undefined";

  /* ============================================================
     1. INTERAÇÕES (sempre rodam, com ou sem GSAP)
     ============================================================ */

  /* ---------- Cabeçalho que reage à rolagem ---------- */
  var topo = document.getElementById("topo");
  if (topo) {
    var marcarTopo = function () {
      topo.classList.toggle("rolando", window.scrollY > 8);
    };
    marcarTopo();
    window.addEventListener("scroll", marcarTopo, { passive: true });
  }

  /* ---------- Menu do celular ---------- */
  var gaveta = document.getElementById("gaveta");
  var abrir = document.getElementById("abrirMenu");
  var fechar = document.getElementById("fecharMenu");
  var fundo = document.getElementById("fecharMenuFundo");

  if (gaveta && abrir) {
    var abrirMenu = function () {
      gaveta.setAttribute("aria-hidden", "false");
      abrir.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var primeiro = gaveta.querySelector("a, button:not([tabindex='-1'])");
      if (primeiro) primeiro.focus({ preventScroll: true });
    };

    var fecharMenu = function () {
      gaveta.setAttribute("aria-hidden", "true");
      abrir.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      abrir.focus({ preventScroll: true });
    };

    abrir.addEventListener("click", abrirMenu);
    if (fechar) fechar.addEventListener("click", fecharMenu);
    if (fundo) fundo.addEventListener("click", fecharMenu);

    gaveta.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", fecharMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && gaveta.getAttribute("aria-hidden") === "false") fecharMenu();
    });
  }

  /* ---------- Carrossel do topo ---------- */
  function iniciarCarrossel() {
    var caixa = document.getElementById("carrossel");
    if (!caixa) return;

    var slides = Array.prototype.slice.call(caixa.querySelectorAll(".carrossel__slide"));
    if (slides.length < 2) return;

    var pontos = document.getElementById("carrosselPontos");
    var anterior = document.getElementById("carrosselAnterior");
    var proximo = document.getElementById("carrosselProximo");

    var atual = 0;
    var relogio = null;
    var PAUSA = 6000;

    // pontos de navegação
    var botoes = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "carrossel__ponto";
      b.setAttribute("aria-label", "Ver foto " + (i + 1));
      b.setAttribute("aria-current", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        irPara(i);
        reiniciar();
      });
      if (pontos) pontos.appendChild(b);
      return b;
    });

    function irPara(indice) {
      if (indice === atual) return;
      var entra = slides[indice];
      var sai = slides[atual];

      if (temGsap && !menosMovimento) {
        gsap.to(sai, { opacity: 0, duration: 0.9, ease: "power2.inOut" });
        gsap.fromTo(
          entra,
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" }
        );
      } else {
        sai.style.opacity = "0";
        entra.style.opacity = "1";
      }

      botoes[atual].setAttribute("aria-current", "false");
      botoes[indice].setAttribute("aria-current", "true");
      atual = indice;
    }

    var avancar = function () { irPara((atual + 1) % slides.length); };
    var voltar = function () { irPara((atual - 1 + slides.length) % slides.length); };

    function tocar() {
      if (menosMovimento) return;       // sem rodízio automático
      parar();
      relogio = setInterval(avancar, PAUSA);
    }
    function parar() {
      if (relogio) { clearInterval(relogio); relogio = null; }
    }
    function reiniciar() { parar(); tocar(); }

    if (proximo) proximo.addEventListener("click", function () { avancar(); reiniciar(); });
    if (anterior) anterior.addEventListener("click", function () { voltar(); reiniciar(); });

    // pausa quando o visitante está interagindo ou saiu da aba
    caixa.addEventListener("mouseenter", parar);
    caixa.addEventListener("mouseleave", tocar);
    caixa.addEventListener("focusin", parar);
    caixa.addEventListener("focusout", tocar);
    document.addEventListener("visibilitychange", function () {
      document.hidden ? parar() : tocar();
    });

    // teclado
    caixa.setAttribute("tabindex", "0");
    caixa.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { avancar(); reiniciar(); }
      if (e.key === "ArrowLeft") { voltar(); reiniciar(); }
    });

    // arrastar com o dedo
    var inicioX = null;
    caixa.addEventListener("pointerdown", function (e) { inicioX = e.clientX; }, { passive: true });
    caixa.addEventListener("pointerup", function (e) {
      if (inicioX === null) return;
      var delta = e.clientX - inicioX;
      if (Math.abs(delta) > 45) { delta < 0 ? avancar() : voltar(); reiniciar(); }
      inicioX = null;
    }, { passive: true });

    tocar();
  }

  iniciarCarrossel();

  /* ============================================================
     2. SEM GSAP: mostra tudo e encerra
     ============================================================ */

  if (!temGsap || menosMovimento) {
    raiz.classList.remove("anima-pronto");
    document.querySelectorAll("[data-anima]").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    // a trajetória entra pronta, com o trilho inteiro preenchido
    var barraTrilha = document.getElementById("trilhaProgresso");
    if (barraTrilha) barraTrilha.style.transform = "scaleY(1)";
    mostrarContadores();
    return;
  }

  raiz.classList.add("anima-ok");
  gsap.registerPlugin(ScrollTrigger);
  var temSplit = typeof window.SplitText !== "undefined";
  if (temSplit) gsap.registerPlugin(SplitText);

  /* ============================================================
     3. ENTRADA DO TOPO
     ============================================================ */

  var linhaDoTempo = gsap.timeline({ defaults: { ease: "power3.out" } });

  var titulo = document.getElementById("tituloHero");
  if (titulo && temSplit) {
    // mask: "lines" faz cada linha subir de dentro de uma janela,
    // e autoSplit refaz a divisão quando a tela muda de tamanho
    SplitText.create(titulo, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: function (self) {
        return gsap.from(self.lines, {
          yPercent: 115,
          duration: 1.1,
          stagger: 0.11,
          ease: "power4.out"
        });
      }
    });
    linhaDoTempo.to({}, { duration: 0.35 });
  } else if (titulo) {
    linhaDoTempo.from(titulo, { opacity: 0, y: 34, duration: 0.9 });
  }

  linhaDoTempo.to(
    '[data-anima="hero"]',
    { opacity: 1, y: 0, duration: 0.85, stagger: 0.11 },
    "-=0.35"
  );

  gsap.set('[data-anima="hero"]', { y: 26 });

  var midia = document.querySelector('[data-anima="midia"]');
  if (midia) {
    gsap.set(midia, { y: 40, scale: 0.97 });
    linhaDoTempo.to(midia, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, "-=0.9");
  }

  // o destaque âmbar do título é preenchido da esquerda para a direita
  var destaque = document.querySelector(".hero h1 em");
  if (destaque) {
    gsap.set(destaque, { "--traco": "0%" });
    linhaDoTempo.to(destaque, { "--traco": "100%", duration: 0.85, ease: "power2.inOut" }, "-=0.55");
  }

  /* ============================================================
     4. REVELAR AO ROLAR
     ============================================================ */

  var entradas = {
    cima: { y: 44, x: 0 },
    esquerda: { x: -48, y: 0 },
    direita: { x: 48, y: 0 }
  };

  /* Cards irmãos entram em cascata, como um grupo. Marcamos esses
     filhos antes para que não ganhem também uma animação individual:
     dois gatilhos no mesmo elemento brigam entre si e o elemento
     acaba ficando invisível. */
  var emGrupo = new Set();
  var grupos = [];

  [".numeros__barra", ".pilares", ".projetos", ".documentos", ".parceiros", ".apoio"].forEach(
    function (seletor) {
      document.querySelectorAll(seletor).forEach(function (grupo) {
        var filhos = gsap.utils.toArray(grupo.children).filter(function (f) {
          return f.hasAttribute("data-anima");
        });
        if (filhos.length < 2) return;
        filhos.forEach(function (f) { emGrupo.add(f); });
        grupos.push({ grupo: grupo, filhos: filhos });
      });
    }
  );

  Object.keys(entradas).forEach(function (tipo) {
    gsap.utils.toArray('[data-anima="' + tipo + '"]').forEach(function (el) {
      if (emGrupo.has(el)) return;
      gsap.set(el, entradas[tipo]);
      gsap.to(el, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        // 97%: o que já aparece na primeira tela entra junto com ela,
        // sem esperar o visitante rolar
        scrollTrigger: { trigger: el, start: "top 97%", once: true }
      });
    });
  });

  grupos.forEach(function (item) {
    gsap.set(item.filhos, { opacity: 0, y: 44 });
    gsap.to(item.filhos, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: item.grupo, start: "top 88%", once: true }
    });
  });

  /* ============================================================
     4b. TRAJETÓRIA
     Construção da linha do tempo do Benedito: o trilho se preenche
     preso à rolagem e, quando o capítulo chega, o ponto estoura no
     trilho, o ano e o rótulo entram pela esquerda (no sentido em que
     a linha é lida) e o texto sobe atrás.
     ============================================================ */

  var trilha = document.getElementById("trilha");
  if (trilha) {
    var progresso = document.getElementById("trilhaProgresso");
    var passos = trilha.querySelectorAll("[data-passo]");
    var linha = trilha.querySelector(".trilha__linha");

    /* A linha termina no centro do último ponto, e não no fim do
       bloco: sobra de trilho depois do último marco dá impressão de
       conteúdo faltando. Se este cálculo falhar, o CSS já deixa a
       linha inteira, então nada quebra. */
    function ajustarFimDaLinha() {
      var ultimo = trilha.querySelector(".marco:last-child .marco__ponto");
      if (!ultimo || !linha) return;
      // volta ao estado do CSS antes de medir, senão a medida anterior
      // contamina a nova
      linha.style.height = "";
      linha.style.bottom = "";
      var topo = linha.getBoundingClientRect().top;
      var centro = ultimo.getBoundingClientRect().top + ultimo.offsetHeight / 2;
      linha.style.bottom = "auto";
      linha.style.height = Math.max(0, centro - topo) + "px";
    }

    // refreshInit roda antes de o ScrollTrigger recalcular posições,
    // inclusive a cada redimensionamento: é o lugar certo para mexer
    // no layout sem cair em laço de refresh
    ScrollTrigger.addEventListener("refreshInit", ajustarFimDaLinha);
    ajustarFimDaLinha();

    /* 1. O trilho, preso à rolagem. scaleY em vez de height: o
       navegador resolve no compositor, sem recalcular layout a cada
       quadro. */
    gsap.fromTo(
      progresso,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: trilha,
          start: "top 65%",
          end: "bottom 80%",
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      }
    );

    /* 2. Cada capítulo, quando chega: o ponto estoura no trilho, o ano
       e o rótulo entram pela esquerda e o texto sobe atrás. */
    Array.prototype.forEach.call(passos, function (item) {
      gsap
        .timeline({ scrollTrigger: { trigger: item, start: "top 80%", once: true } })
        .fromTo(
          item.querySelectorAll("[data-ponto]"),
          { scale: 0 },
          { scale: 1, duration: 0.5, ease: "back.out(3)" }
        )
        .fromTo(
          item.querySelectorAll("[data-marca]"),
          { x: -28, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          item.querySelectorAll("[data-texto]"),
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: "power3.out" },
          "-=0.5"
        );
    });
  }

  /* ============================================================
     5. CONTADORES
     ============================================================ */

  function mostrarContadores() {
    document.querySelectorAll("[data-contador]").forEach(function (el) {
      el.textContent = formatar(el, Number(el.getAttribute("data-contador")));
    });
  }

  function formatar(el, valor) {
    var prefixo = el.getAttribute("data-prefixo") || "";
    return prefixo + Math.round(valor).toLocaleString("pt-BR");
  }

  document.querySelectorAll("[data-contador]").forEach(function (el) {
    var alvo = Number(el.getAttribute("data-contador"));
    if (!alvo) return;
    var estado = { valor: 0 };

    gsap.to(estado, {
      valor: alvo,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
      onUpdate: function () { el.textContent = formatar(el, estado.valor); },
      onComplete: function () { el.textContent = formatar(el, alvo); }
    });
  });

  /* ============================================================
     6. ACABAMENTOS
     ============================================================ */

  // leve deslocamento das manchas do topo, para dar profundidade
  gsap.utils.toArray(".hero__enfeite").forEach(function (el, i) {
    gsap.to(el, {
      yPercent: i === 0 ? 18 : -14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
  });

  // as fotos das seções ganham um respiro ao rolar
  gsap.utils.toArray(".historia__faixa img").forEach(function (img) {
    gsap.fromTo(
      img,
      { scale: 1.12 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 0.8 }
      }
    );
  });

  // depois que as fontes carregam, as posições mudam: recalcula
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
