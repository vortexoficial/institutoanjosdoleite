import { json, erro, exigirLogin, lerProjetos, CHAVE_PROJETOS } from "./_lib.js";
import { PROJETOS_PADRAO } from "./_projetos-padrao.js";

/* ============================================================
   GET    /api/projetos          lista os projetos      (público)
   POST   /api/projetos          cria ou atualiza um    (protegido)
   DELETE /api/projetos?slug=    remove um              (protegido)

   Um projeto por vez, sempre. Nada de "salvar tudo": um formulário
   único apagaria o que não estivesse na tela e travaria inteiro por
   causa de um campo inválido.
   ============================================================ */

const LIMITES = { nome: 90, etiqueta: 30, resumo: 400, texto: 6000, acao: 160 };

const semAcento = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "");

const criarSlug = (texto) =>
  semAcento(String(texto).toLowerCase())
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

/* Enquanto nada foi salvo, valem os cinco projetos de origem. Assim a
   página inicial nunca fica sem projeto e o Instituto edita a partir
   do que já existe, em vez de começar do zero. */
export async function onRequestGet({ env }) {
  const salvos = await lerProjetos(env);
  return json({ projetos: salvos.length ? salvos : PROJETOS_PADRAO });
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

  const nome = String(corpo?.nome || "").trim();
  if (!nome) return erro("O projeto precisa de um nome.");
  if (nome.length > LIMITES.nome) return erro(`Nome: máximo de ${LIMITES.nome} caracteres.`);

  const slug = criarSlug(corpo?.slug || nome);
  if (!slug) return erro("Não consegui gerar o endereço do projeto a partir desse nome.");

  const etiqueta = String(corpo?.etiqueta || "").trim().slice(0, LIMITES.etiqueta);
  const resumo = String(corpo?.resumo || "").trim().slice(0, LIMITES.resumo);
  const texto = String(corpo?.texto || "").trim().slice(0, LIMITES.texto);
  const imagem = String(corpo?.imagem || "").trim().slice(0, 60);

  const acoes = Array.isArray(corpo?.acoes)
    ? corpo.acoes
        .map((a) => String(a || "").trim().slice(0, LIMITES.acao))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  /* Primeira gravação: os cinco de origem entram junto, senão salvar
     um projeto faria os outros quatro sumirem da página inicial. */
  let projetos = await lerProjetos(env);
  if (!projetos.length) projetos = PROJETOS_PADRAO.map((p) => ({ ...p }));

  const posicao = projetos.findIndex((p) => p.slug === slug);

  const registro = {
    slug,
    nome,
    etiqueta,
    resumo,
    texto,
    acoes,
    imagem,
    publicado: corpo?.publicado !== false,
    atualizadoEm: new Date().toISOString()
  };

  if (posicao >= 0) {
    registro.criadoEm = projetos[posicao].criadoEm || registro.atualizadoEm;
    projetos[posicao] = registro;
  } else {
    registro.criadoEm = registro.atualizadoEm;
    projetos.push(registro);
  }

  await env.CMS.put(CHAVE_PROJETOS, JSON.stringify(projetos));
  return json({ ok: true, projeto: registro });
}

export async function onRequestDelete({ request, env }) {
  const bloqueio = await exigirLogin(request, env);
  if (bloqueio) return bloqueio;
  if (!env.CMS) return erro("Armazenamento não configurado (binding CMS).", 503);

  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return erro("Informe o projeto.");

  const projetos = (await lerProjetos(env)).filter((p) => p.slug !== slug);
  await env.CMS.put(CHAVE_PROJETOS, JSON.stringify(projetos));

  return json({ ok: true });
}
