/* ============================================================
   Utilidades compartilhadas das rotas do painel.

   Autenticação: a senha nunca chega ao navegador. O login devolve
   um token assinado com HMAC (validade de 12 horas) e cada rota
   protegida confere a assinatura antes de gravar qualquer coisa.

   A senha vive na variável de ambiente PAINEL_SENHA, configurada
   no painel da Cloudflare. Não existe senha padrão no código: sem
   a variável, o painel simplesmente não abre.
   ============================================================ */

const VALIDADE_MS = 12 * 60 * 60 * 1000; // 12 horas

export const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

export const erro = (mensagem, status = 400) => json({ erro: mensagem }, status);

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function assinar(texto, segredo) {
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(texto));
  return base64url(assinatura);
}

/** Sem PAINEL_SENHA configurada, nenhuma rota protegida funciona. */
export function senhaConfigurada(env) {
  return typeof env.PAINEL_SENHA === "string" && env.PAINEL_SENHA.length >= 8;
}

const segredoDe = (env) => env.PAINEL_SENHA + "|instituto-anjos-do-leite|v1";

export async function criarToken(env) {
  const corpo = String(Date.now() + VALIDADE_MS);
  return corpo + "." + (await assinar(corpo, segredoDe(env)));
}

export async function autorizado(request, env) {
  if (!senhaConfigurada(env)) return false;

  const cabecalho = request.headers.get("Authorization") || "";
  const token = cabecalho.replace(/^Bearer\s+/i, "").trim();
  if (!token.includes(".")) return false;

  const [corpo, assinatura] = token.split(".");
  const expira = Number(corpo);
  if (!expira || Date.now() > expira) return false;

  const esperado = await assinar(corpo, segredoDe(env));
  if (assinatura.length !== esperado.length) return false;

  // comparação de tempo constante
  let diferenca = 0;
  for (let i = 0; i < assinatura.length; i++) {
    diferenca |= assinatura.charCodeAt(i) ^ esperado.charCodeAt(i);
  }
  return diferenca === 0;
}

export async function exigirLogin(request, env) {
  if (!senhaConfigurada(env)) {
    return erro("Painel não configurado: falta a variável PAINEL_SENHA.", 503);
  }
  if (!(await autorizado(request, env))) {
    return erro("Sessão expirada. Entre novamente.", 401);
  }
  return null;
}

/* ---------- Armazenamento ---------- */

export const CHAVE_IMAGENS = "site:imagens";
export const CHAVE_CONTEUDO = "site:conteudo";
export const CHAVE_PROJETOS = "site:projetos";

async function lerJson(env, chave, padrao) {
  if (!env.CMS) return padrao;
  const bruto = await env.CMS.get(chave);
  if (!bruto) return padrao;
  try {
    return JSON.parse(bruto);
  } catch {
    return padrao;
  }
}

export const lerImagens = (env) => lerJson(env, CHAVE_IMAGENS, {});
export const lerConteudo = (env) => lerJson(env, CHAVE_CONTEUDO, {});

export async function lerProjetos(env) {
  const lista = await lerJson(env, CHAVE_PROJETOS, []);
  return Array.isArray(lista) ? lista : [];
}
