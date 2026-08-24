import { json, erro, criarToken, senhaConfigurada } from "./_lib.js";

/* POST /api/login  { senha }  ->  { token } */

export async function onRequestPost({ request, env }) {
  if (!senhaConfigurada(env)) {
    return erro(
      "Painel ainda não configurado. Defina a variável PAINEL_SENHA no projeto da Cloudflare.",
      503
    );
  }

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro("Requisição inválida.");
  }

  const enviada = String(corpo?.senha || "");
  const correta = env.PAINEL_SENHA;

  // comparação de tempo constante, para não vazar o tamanho da senha
  let diferenca = enviada.length ^ correta.length;
  for (let i = 0; i < Math.max(enviada.length, correta.length); i++) {
    diferenca |= (enviada.charCodeAt(i) || 0) ^ (correta.charCodeAt(i) || 0);
  }

  if (diferenca !== 0) {
    // pequena espera para desestimular tentativa em massa
    await new Promise((r) => setTimeout(r, 700));
    return erro("Senha incorreta.", 401);
  }

  return json({ token: await criarToken(env) });
}
