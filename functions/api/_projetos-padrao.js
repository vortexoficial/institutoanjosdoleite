/* ============================================================
   Os cinco projetos com que o site nasceu.

   Servem para duas coisas: são o que a API devolve enquanto nada
   foi salvo no painel, e são a base semeada na primeira vez que o
   Instituto salva alguma coisa. Sem isso, salvar o primeiro projeto
   apagaria os outros quatro da página inicial.

   Texto igual ao das páginas em src/paginas/projetos.
   ============================================================ */

export const PROJETOS_PADRAO = [
  {
    slug: "mae-acolhida",
    nome: "Projeto Mãe Acolhida",
    etiqueta: "Acolhimento",
    imagem: "projeto-mae-acolhida",
    resumo:
      "Acolhimento individual a mães em situação de vulnerabilidade, com escuta qualificada, orientação sobre amamentação e encaminhamento para a rede de saúde.",
    texto:
      "O Mãe Acolhida existe para chegar onde a informação costuma não chegar. Muitas mulheres desistem de amamentar não por falta de vontade, mas por falta de alguém que explique, examine e acompanhe nos primeiros dias.\n\nO projeto oferece atendimento individual, escuta qualificada e orientação prática sobre pega, ordenha, fissuras e produção de leite, sempre com base em evidências científicas. Quando o caso exige, a família é encaminhada para a rede pública de saúde com um relatório claro do que foi observado.\n\nO acompanhamento não termina no primeiro contato: a mãe segue com um canal aberto para tirar dúvidas nas semanas seguintes, que são justamente as mais difíceis.",
    acoes: [],
    publicado: true
  },
  {
    slug: "hora-do-mamaco",
    nome: "Hora do Mamaço",
    etiqueta: "Mobilização",
    imagem: "projeto-hora-do-mamaco",
    resumo:
      "A maior ação pública de incentivo ao aleitamento materno da região, realizada há 14 anos em Santos.",
    texto:
      "A Hora do Mamaço reúne mães, bebês, famílias e profissionais de saúde em um ato coletivo de amamentação. É uma demonstração pública de que amamentar em espaço público é um direito, e de que nenhuma mãe precisa se esconder para alimentar o próprio filho.\n\nO Instituto integra a organização do movimento em Santos há 14 anos e, desde 2022, responde pela coordenação. O evento acontece dentro da Semana Mundial de Aleitamento Materno e envolve secretarias, unidades de saúde, universidades e voluntários.\n\nAlém do ato em si, a Hora do Mamaço leva orientação gratuita, tira dúvidas no local e aproxima famílias dos serviços que elas nem sabiam que existiam.",
    acoes: [],
    publicado: true
  },
  {
    slug: "formacao",
    nome: "Formação e Capacitação de Profissionais",
    etiqueta: "Formação",
    imagem: "projeto-formacao",
    resumo:
      "Cursos, oficinas e supervisão para enfermeiros, técnicos, doulas e estudantes, com prática baseada em evidências científicas.",
    texto:
      "Formar quem atende é multiplicar o cuidado. Uma orientação errada dada com boa intenção na maternidade pode encerrar uma amamentação que teria dado certo.\n\nO projeto oferece cursos, oficinas práticas e supervisão a profissionais de saúde e estudantes, com conteúdo atualizado e baseado em evidências: avaliação da mamada, manejo clínico, dificuldades comuns, uso de bombas e ordenha, e comunicação com a família.\n\nA formação é pensada para a realidade do serviço público e do consultório particular, com material de apoio e acompanhamento após o curso.",
    acoes: [],
    publicado: true
  },
  {
    slug: "educacao-em-saude",
    nome: "Educação em Saúde",
    etiqueta: "Educação",
    imagem: "projeto-educacao",
    resumo:
      "Rodas de conversa, palestras e conteúdo acessível para gestantes e famílias, do pré-natal aos primeiros anos.",
    texto:
      "Informação clara, no momento em que a dúvida aparece. O projeto leva conteúdo de saúde materno-infantil para gestantes, mães, pais e cuidadores em linguagem simples, sem termo técnico desnecessário e sem julgamento.\n\nAs atividades acontecem em rodas de conversa, palestras em unidades de saúde, empresas e escolas, e em conteúdo publicado nos canais do Instituto.\n\nOs temas saem das perguntas que mais aparecem no atendimento: preparo na gestação, primeiros dias, retorno ao trabalho, introdução alimentar e sinais que pedem ajuda profissional.",
    acoes: [],
    publicado: true
  },
  {
    slug: "primeira-infancia",
    nome: "Primeira Infância",
    etiqueta: "Desenvolvimento",
    imagem: "projeto-primeira-infancia",
    resumo:
      "Ações voltadas ao desenvolvimento saudável nos primeiros mil dias de vida, com atenção ao vínculo, à nutrição e aos sinais que pedem cuidado especializado.",
    texto:
      "Os primeiros mil dias, da gestação aos dois anos, definem boa parte da saúde de uma pessoa para a vida inteira. É a janela em que o cuidado rende mais.\n\nO projeto acompanha famílias nesse período com orientação sobre vínculo, nutrição, sono, desenvolvimento motor e oral, e identificação precoce de sinais que pedem avaliação especializada.\n\nA atuação se apoia na formação da fundadora em enfermagem e, agora, em fonoaudiologia, com atenção especial à motricidade orofacial e ao desenvolvimento infantil.",
    acoes: [],
    publicado: true
  }
];
