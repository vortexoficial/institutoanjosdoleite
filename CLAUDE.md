# Instituto Anjos do Leite, site institucional (cliente: INSTITUTO ANJOS DO LEITE)

Site institucional da ONG de apoio à amamentação e à primeira infância fundada por Sandra Abreu (Santos). Reformulação total iniciada em 24/08/2026: saiu uma página única centrada na fundadora, entra um site de 15 páginas no padrão das grandes fundações, com painel de conteúdo. Plano completo em `..\PLANO-DO-SITE.md`. Memória do cliente em `~/.claude/brain/clientes/instituto-anjos-do-leite/`.

Estado: 8 páginas no ar (home, fundadora, privacidade e as 5 de projeto). O menu leva a âncoras da própria home, que é onde está quase tudo o que o visitante procura. Só ganham página própria os conteúdos que o Instituto edita pelo painel: projetos e fundadora.

## Como rodar localmente
- `npm install` uma vez (dependência única: esbuild, usada só no build de produção).
- `node construir.js` monta a pasta `dist/`. Depois `node servir.js` e abrir http://localhost:5173 (site estático, sem painel).
- Para o painel e as Functions: `npx wrangler pages dev --port 8789 --kv CMS --binding PAINEL_SENHA=<senha de teste>`. O KV fica em `.wrangler/`, só na máquina.
- Sempre rodar `node construir.js` depois de editar `src/`: o navegador carrega a `dist/`, não a `src/`.

## Como publicar
- No ar em https://instituto-anjos-do-leite.pages.dev desde 24/08/2026 (Cloudflare Pages, projeto instituto-anjos-do-leite, conta indesignleandro@gmail.com). O KV CMS já existe e está no wrangler.toml; a senha do painel é o segredo PAINEL_SENHA do projeto.
- Deploy: `node construir.js --producao` e depois `npx wrangler pages deploy dist --project-name=instituto-anjos-do-leite --branch=main`.
- Trocar a senha do painel: `npx wrangler pages secret put PAINEL_SENHA --project-name=instituto-anjos-do-leite` e publicar de novo.
- Nunca publicar a raiz do projeto (subiria `node_modules` e `src/`). Nunca editar `dist/` à mão: é apagada a cada build.

## Estrutura
- `src/molde.html`: esqueleto de toda página, com `{{titulo}}`, `{{descricao}}`, `{{caminho}}`, `{{topo}}`, `{{rodape}}`, `{{icones}}`, `{{conteudo}}`.
- `src/paginas/*.html`: só o miolo de cada página, começando pelo bloco `<!--dados { ... } -->` com título, descrição e caminho.
- `src/parciais/`: `topo.html`, `rodape.html` e `icones.svg` (sprite gerado por `gerar-icones.js` a partir de `..\_icones-fonte`).
- `src/css/style.css`: sistema de design inteiro. Toda cor e medida em `:root`.
- `src/js/main.js`: GSAP (entrada do topo, revelar ao rolar, contadores, carrossel). `src/js/imagens.js`: aplica o que foi trocado no painel. `src/js/vendor/`: GSAP 3.13 local, sem CDN.
- `assets/`: marca convertida e `img/` com os espaços reservados de foto (SVG gerados por `gerar-placeholders.js`).
- `functions/`: `api/login.js`, `api/sessao.js`, `api/imagens.js`, `api/conteudo.js`, `api/projetos.js`, `api/_projetos-padrao.js` (os 5 projetos de origem), `api/_lib.js` (token HMAC de 12 h) e `midia/[chave].js`.
- `painel/`: painel do Instituto (trocar fotos e informações).
- `construir.js` (build; aceita `--producao`, `--saida=docs` e `--base=repo`), `servir.js` (preview local), `verificar.js` (teste de responsividade), `gerar-icones.js`, `gerar-placeholders.js`, `gerar-paginas.js` (páginas de projeto).
- `docs/`: build publicado no GitHub Pages, para prévia. Gerado com `node construir.js --producao --saida=docs --base=institutoanjosdoleite`. Lá não existem Functions: o painel e as APIs só funcionam no Cloudflare.

## Convenções deste projeto
- Português do Brasil em tudo, inclusive nomes de variáveis, classes CSS e comentários.
- Nunca emoji em interface. Ícones só pelo sprite Lucide (`<svg><use href="#i-nome"/></svg>`).
- Nunca travessão (em-dash) em texto visível, comentário ou documentação.
- Cores só pelas variáveis: roxo `#6A239A` (9,05:1 sobre branco), âmbar `#FBB921` (só fundo e detalhe, nunca texto sobre branco), botão principal = fundo âmbar com texto roxo (5,2:1).
- Nenhum bloco de conteúdo com largura ou altura travada em pixel. Grades sempre com `minmax(min(100%, Xpx), 1fr)`. Texto nunca truncado.
- Toda área clicável com pelo menos 44 px de altura.
- O site funciona sem JavaScript e sem GSAP: as animações são acabamento. Tudo respeita `prefers-reduced-motion`.
- Sinal das etiquetas de seção: losango âmbar (o mesmo que separa os valores na faixa em laço). Nada de barras ou traços decorativos.
- Faixa que anda em laço: `data-laco` + `data-laco-trilho` (mecânica do bloco faixa-marquee do registro da agência). O JS duplica a lista e calcula a duração pela largura; quem anima é o CSS.
- Assinatura da agência no rodapé: `/assets/futura-design.webp` (marca preta, invertida por filtro sobre o fundo escuro).
- Foto nova no site: colocar `data-img="chave"` no HTML e a mesma chave na lista `GRUPOS` de `painel/js/painel.js`. Texto editável: `data-campo="nome"` no HTML e o nome em `CAMPOS` de `functions/api/conteudo.js` e de `painel/js/painel.js`.
- Arquivos longos: gravar com a ferramenta Write. Nunca `Set-Content`/`Out-File` do PowerShell (corrompe acentos).

## Não mexer / armadilhas conhecidas
- `_headers` guarda css e js por um ano. O `construir.js` carimba `?v=` em toda página, inclusive no HTML do painel; sem esse carimbo a edição não aparece na tela.
- No painel, `[hidden] { display: none !important }` é obrigatório: sem ele o `display: grid` da tela de login vence o atributo e a tela some do JS mas continua na tela.
- Não criar dois gatilhos de animação para o mesmo elemento. Os cards que entram em cascata são marcados em `emGrupo` e ficam de fora da animação individual; dois gatilhos no mesmo elemento deixam ele invisível.
- O SplitText usa `mask: "lines"`, que corta qualquer coisa fora da caixa da linha. Por isso o destaque âmbar do título é um `background-image` do próprio `<em>`, e não um traço posicionado embaixo.
- `compatibility_date` no `wrangler.toml` não pode ser mais nova que a versão do wrangler instalado, senão o servidor local nem inicia.
- Sem a variável `PAINEL_SENHA`, nenhuma rota protegida funciona (de propósito: não existe senha padrão no código).
- Testar com `node verificar.js` e abrir `/_verificacao.html`: ele mede rolagem lateral, elementos fora da borda, texto cortado e alvo de toque em 8 larguras. Esse arquivo fica só na `dist` e está bloqueado no `robots.txt`.

## Pendências de conteúdo (antes de publicar)
- CNPJ real (hoje está `00.000.000/0001-00` no rodapé e na transparência).
- Fotos reais do Instituto, com autorização de uso de imagem por escrito, principalmente de crianças.
- E-mail institucional, Facebook e LinkedIn (o rodapé mostra só Instagram e WhatsApp, que são os canais confirmados).
- Vetor da marca (hoje só existe PNG comprimido; ver `~/.claude/brain/clientes/instituto-anjos-do-leite/marca-paleta.md`).

## Verificar antes de entregar
- `node --check` nos JS alterados, `node construir.js`, abrir o site e conferir o console sem erro.
- `node verificar.js` e conferir "Aprovado nas 8 larguras".
- Sem emoji, sem travessão, acentos corretos (UTF-8).
