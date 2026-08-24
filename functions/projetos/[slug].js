import { lerProjetos } from "../api/_lib.js";

/* ============================================================
   GET /projetos/<endereço>.html

   Os cinco projetos de origem têm página escrita à mão e gerada no
   build: essas continuam sendo servidas como arquivo, sem passar
   por aqui de verdade.

   Um projeto criado no painel não tem arquivo nenhum, e o pedido
   caía na página inicial. Para esses, o molde _modelo.html é
   preenchido com o nome, a etiqueta e o resumo salvos. O resto do
   conteúdo (texto, ações e galeria) o próprio site monta pela API,
   igual faz nas páginas escritas à mão.
   ============================================================ */

const escapar = (texto) =>
  String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const pagina = (html, status) =>
  new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      /* montada na hora a partir do painel: guardar por muito tempo
         deixaria o texto velho no ar depois de uma edição */
      "Cache-Control": "public, max-age=60"
    }
  });

export async function onRequestGet({ params, request, env }) {
  const alvo = String(params.slug || "").replace(/\.html$/, "");

  const buscar = (caminho) => env.ASSETS.fetch(new URL(caminho, request.url));

  /* 1. página escrita à mão. O Pages devolve a página inicial quando
     o arquivo não existe, então a confirmação é o endereço que ela
     mesma carrega, e não o código de resposta. */
  const estatica = await buscar(`/projetos/${alvo}.html`);
  const html = await estatica.text();
  if (html.includes(`data-projeto-slug="${alvo}"`)) return pagina(html, 200);

  if (!/^[a-z0-9-]{1,60}$/.test(alvo)) return pagina(html, 404);

  /* 2. projeto criado no painel */
  const projetos = await lerProjetos(env);
  const projeto = projetos.find((p) => p.slug === alvo && p.publicado !== false);
  if (!projeto) return pagina(html, 404);

  const modelo = await buscar("/projetos/_modelo.html");
  if (!modelo.ok) return pagina(html, 404);

  const nome = escapar(projeto.nome);
  const resumo = escapar(projeto.resumo);

  const corpo = (await modelo.text())
    .split("__TITULO__").join(`${nome} | Instituto Anjos do Leite`)
    .split("__DESCRICAO__").join(resumo)
    .split("__ETIQUETA__").join(escapar(projeto.etiqueta) || "Projeto")
    .split("__RESUMO__").join(resumo)
    .split("__CAPA__").join(escapar(projeto.imagem) || `projeto-${alvo}-1`)
    .split("__NOME__").join(nome)
    .split("__SLUG__").join(alvo);

  return pagina(corpo, 200);
}
