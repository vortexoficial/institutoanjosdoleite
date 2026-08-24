import { json, exigirLogin } from "./_lib.js";

/* GET /api/sessao
   Só serve para o painel saber se o token guardado ainda vale.
   Sem isso, o painel abriria com uma sessão vencida e só
   descobriria o problema na hora de salvar. */

export async function onRequestGet({ request, env }) {
  const bloqueio = await exigirLogin(request, env);
  if (bloqueio) return bloqueio;
  return json({ ok: true });
}
