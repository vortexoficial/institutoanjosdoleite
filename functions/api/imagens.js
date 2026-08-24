import { json, erro, exigirLogin, lerImagens, CHAVE_IMAGENS } from "./_lib.js";

/* ============================================================
   GET    /api/imagens          mapa chave -> url   (público)
   POST   /api/imagens          envia uma foto      (protegido)
   DELETE /api/imagens?chave=   volta ao espaço reservado (protegido)

   O arquivo fica no KV em "img:<chave>" e é servido por
   /midia/<chave>. O mapa guarda só os dados de controle.
   ============================================================ */

const LIMITE = 8 * 1024 * 1024; // 8 MB por foto
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

export async function onRequestGet({ env }) {
  return json({ imagens: await lerImagens(env) });
}

export async function onRequestPost({ request, env }) {
  const bloqueio = await exigirLogin(request, env);
  if (bloqueio) return bloqueio;
  if (!env.CMS) return erro("Armazenamento não configurado (binding CMS).", 503);

  let formulario;
  try {
    formulario = await request.formData();
  } catch {
    return erro("Envio inválido.");
  }

  const chave = String(formulario.get("chave") || "").trim();
  const arquivo = formulario.get("arquivo");

  if (!/^[a-z0-9._-]{2,60}$/i.test(chave)) return erro("Identificador de foto inválido.");
  if (!arquivo || typeof arquivo === "string") return erro("Selecione um arquivo de imagem.");
  if (!TIPOS.includes(arquivo.type)) {
    return erro("Formato não aceito. Use JPG, PNG ou WebP.");
  }
  if (arquivo.size > LIMITE) {
    return erro("Imagem muito pesada (máximo 8 MB). Reduza o arquivo antes de enviar.");
  }

  const bytes = await arquivo.arrayBuffer();
  const versao = Date.now().toString(36);

  await env.CMS.put("img:" + chave, bytes, { metadata: { tipo: arquivo.type, versao } });

  const mapa = await lerImagens(env);
  mapa[chave] = {
    url: `/midia/${chave}?v=${versao}`,
    tipo: arquivo.type,
    tamanho: arquivo.size,
    atualizadoEm: new Date().toISOString()
  };
  await env.CMS.put(CHAVE_IMAGENS, JSON.stringify(mapa));

  return json({ ok: true, chave, ...mapa[chave] });
}

export async function onRequestDelete({ request, env }) {
  const bloqueio = await exigirLogin(request, env);
  if (bloqueio) return bloqueio;
  if (!env.CMS) return erro("Armazenamento não configurado (binding CMS).", 503);

  const chave = new URL(request.url).searchParams.get("chave");
  if (!chave) return erro("Informe a foto.");

  await env.CMS.delete("img:" + chave);

  const mapa = await lerImagens(env);
  delete mapa[chave];
  await env.CMS.put(CHAVE_IMAGENS, JSON.stringify(mapa));

  return json({ ok: true });
}
