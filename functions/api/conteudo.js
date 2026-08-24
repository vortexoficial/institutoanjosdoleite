import { json, erro, exigirLogin, lerConteudo, CHAVE_CONTEUDO } from "./_lib.js";

/* ============================================================
   GET  /api/conteudo    campos de texto do site   (público)
   POST /api/conteudo    salva UM campo            (protegido)

   Cada campo é salvo sozinho, um de cada vez. Nada de "salvar
   tudo": um formulário grande apaga o que não estava na tela e
   trava inteiro por causa de um único valor inválido.
   ============================================================ */

const CAMPOS = {
  cnpj: { rotulo: "CNPJ", limite: 30 },
  whatsapp: { rotulo: "WhatsApp", limite: 30 },
  email: { rotulo: "E-mail institucional", limite: 120 },
  endereco: { rotulo: "Endereço da sede", limite: 200 },
  "hero-texto": { rotulo: "Texto do banner", limite: 600 },

  /* Página da fundadora */
  "fundadora-nome": { rotulo: "Nome da fundadora", limite: 90 },
  "fundadora-cargo": { rotulo: "Cargo da fundadora", limite: 90 },
  "fundadora-resumo": { rotulo: "Resumo da fundadora", limite: 400 },
  "fundadora-bio": { rotulo: "Biografia da fundadora", limite: 8000 },
  "fundadora-citacao": { rotulo: "Frase da fundadora", limite: 600 }
};

export async function onRequestGet({ env }) {
  return json({ campos: await lerConteudo(env) });
}

export async function onRequestPost({ request, env }) {
  const bloqueio = await exigirLogin(request, env);
  if (bloqueio) return bloqueio;
  if (!env.CMS) return erro("Armazenamento não configurado (binding CMS).", 503);

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro("Requisição inválida.");
  }

  const campo = String(corpo?.campo || "");
  const valor = String(corpo?.valor ?? "").trim();

  const regra = CAMPOS[campo];
  if (!regra) return erro("Campo desconhecido.");
  if (valor.length > regra.limite) {
    return erro(`${regra.rotulo}: máximo de ${regra.limite} caracteres.`);
  }

  const campos = await lerConteudo(env);
  if (valor) campos[campo] = valor;
  else delete campos[campo];

  await env.CMS.put(CHAVE_CONTEUDO, JSON.stringify(campos));

  return json({ ok: true, campo, valor });
}
