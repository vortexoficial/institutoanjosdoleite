/* Serve as fotos enviadas pelo painel, guardadas no KV.

   A URL carrega ?v=<versao>, então pode ter cache longo: trocar a
   foto gera uma versão nova e o navegador busca de novo. */

export async function onRequestGet({ params, env, request }) {
  const chave = String(params.chave || "");
  if (!/^[a-z0-9._-]{2,60}$/i.test(chave)) {
    return new Response("Not found", { status: 404 });
  }
  if (!env.CMS) return new Response("Not found", { status: 404 });

  const { value, metadata } = await env.CMS.getWithMetadata("img:" + chave, {
    type: "arrayBuffer"
  });
  if (!value) return new Response("Not found", { status: 404 });

  const temVersao = new URL(request.url).searchParams.has("v");

  return new Response(value, {
    headers: {
      "Content-Type": (metadata && metadata.tipo) || "image/jpeg",
      "Cache-Control": temVersao
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300"
    }
  });
}
