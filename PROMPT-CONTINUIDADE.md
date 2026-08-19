# Mundo da Luísa — dossiê de continuidade

> **Versão MacBook.** O projeto nasceu num container Linux com Playwright pré-instalado.
> Este documento já está adaptado para a máquina do Cyr: caminhos, build, teste e
> publicação são os do Mac. Onde o procedimento mudou, está marcado com **⟳ mudou**.
>
> Procedência: `src/` foi **reconstruído a partir do `index.html` publicado**
> (2026-08-15). O rebuild confere byte a byte com o arquivo em produção
> (SHA-256 `bf987982…b5b6`), então a fonte é fiel. O que **não** voltou:
> `Roteiro-Luisa-e-as-Quatro-Cores.md` — o roteiro narrativo não está embutido no
> HTML e se perdeu com o container. Os diálogos aprovados continuam vivos dentro
> de `src/rpg_block.js` (campos `abertura`, `final`, `falas`).

---

## 1. O que é

Aplicação web com 7 jogos, feita para uma criança de 7 anos, usando fotos reais dela.
Arquivo único, sem servidor de aplicação, sem framework, sem dependência externa em
runtime. Só um script Python costura os pedaços.

| # | Jogo | Mecânica |
|---|---|---|
| 1 | Jogo da Memória | pares com as fotos · 6/8/10 pares |
| 2 | Quebra-cabeça | deslizante 3×3 e 4×4 sobre uma foto |
| 3 | Ache as Diferenças | adesivos sorteados sobre a foto · 3/5/7 |
| 4 | Ateliê de Adesivos | canvas com adesivos arrastáveis, exporta PNG |
| 5 | Monta a Palavra | pista em emoji, letras embaralhadas · 4–5 / 6 / 7–9 letras |
| 6 | Conta com a Luísa | até 20 · dezenas até 100 e parcela que falta · vezes, dobro e metade |
| 7 | Aventura de Luísa | RPG top-down 16-bit, **10 capítulos** em 2 aventuras, 3 dificuldades |

**Regra dos jogos 5 e 6.** Calibragem revista em 2026-08-19: a primeira versão
ficou em nível de 5 anos, não de 7. Hoje a régua é **2º ano**:

| Nível | Palavra | Conta |
|---|---|---|
| Fácil | 4 e 5 letras | somar e subtrair até 20 |
| Médio | 6 letras | dezenas até 100 · parcela que falta |
| Difícil | 7 a 9 letras, com dígrafo | vezes como soma repetida · dobro · metade |

O que define o nível da palavra não é só o tamanho: é o **dígrafo** (ch, lh, nh,
rr, ss, gu) e o **encontro consonantal** (br, cr, tr, pl, gr) — é ali que a
criança de 7 anos tropeça. Distratoras no banco: 2, 3 e 4 por nível.

Travas de calibragem que já mordi:

- **Parcela que falta tem total preso em 20.** Com total 29 a resposta vira 23,
  que é conta de cabeça de 3º/4º ano.
- **Risco vermelho é subtração, casa vazia é parcela que falta.** São duas ideias
  diferentes; `quadroDez(total, riscar, capacidade)` separa as duas.
- **9 letras não cabem em 375px com slot de 52px.** `.longo`/`.xlongo` encolhem o
  slot; o banco de letras **não** encolhe, porque é ele o alvo de toque. Para
  apagar existe o botão ↩️, de 44px.

Outras regras que continuam valendo:

- **Errar não pune e não tira opção.** No jogo de palavras as letras voltam para o
  banco; no de números o botão errado apaga mas o certo continua lá.
- **Dois erros acionam ajuda sozinha** — a dica trava uma letra certa, ou o apoio
  visual pulsa para ela contar junto. Ela nunca fica presa numa tela.
- **O botão 💡 Dica não tem limite.** Trava sempre a próxima letra certa no lugar.
- **Pista de palavra precisa de nome óbvio.** Já mordeu: 🏞️ para RIO parece foto
  emoldurada; 🧸 é urso, não boneca; 🧒 para TOBIAS ela lê "menino". Emoji ambíguo
  fora — a única exceção é LUÍSA, cuja pista é uma foto dela.
- **Toda conta tem apoio visual**: quadro de dez até 20, material dourado (barra
  de 10 + unidade) até 100, e grupos de objetos para as vezes.
- **`montaConta(nivel)` e `opcoesPara(resp)` são fonte única** — o jogo do menu e
  as metas `numero` do RPG chamam as mesmas funções. Estavam duplicados e
  duplicata diverge.

**Destinatária:** Luísa, 7 anos, joga sozinha num iPad. Não lê texto longo.
Nunca pode ficar travada sem saber o que fazer. Não existe "game over".
Ela é sempre a heroína — ninguém a resgata.

---

## 2. Estrutura do projeto  ⟳ mudou

Pasta no Mac: **`~/Documents/Desenvolvimento/mundo-luisa-k7q3`**
(é o próprio clone do repositório — publicar é `git push`).

```
mundo-luisa-k7q3/
├── build.py                     gera o index.html
├── publicar.sh                  build + teste + push  ⟳ novo
├── index.html                   GERADO — nunca editar à mão
├── robots.txt
├── PROMPT-CONTINUIDADE.md       este arquivo
├── tests/
│   └── smoke.js                 checklist de entrega em Playwright
└── src/
    ├── app_template.html   casca: HTML, CSS e JS dos jogos 1–6  (55 KB)
    ├── rpg_block.js        motor do RPG + os 5 capítulos        (50 KB)
    ├── atlas.png           4 KB · 16 personagens (16×24) + 39 tiles (16×16)
    ├── icon.png            ícone da Tela de Início              ⟳ virou arquivo
    └── fotos/f00..f19.jpg  20 fotos 360×360 q72 (430 KB no total)
```

**Como o build funciona:** `app_template.html` tem 4 marcadores que o `build.py`
substitui — `__RPGJS__` (o motor inteiro), `__ATLAS__` (o PNG em base64),
`__IMGS__` (array JSON das 20 fotos em base64) e `__ICON__` (o ícone).

⟳ **O ícone virou asset versionado** (`src/icon.png`). Antes era gerado em tempo
de build a partir de `fotos/f14.jpg`; o código que gerava se perdeu, e reproduzi-lo
de cabeça mudaria os bytes do arquivo publicado. Assim o rebuild é idêntico ao que
está no ar. Para trocar o ícone, gere um PNG novo e substitua o arquivo.

O `build.py` também **valida os mapas antes de gerar**: 16 linhas de exatamente
20 caracteres. Se não bater, ele para e diz qual mapa e qual linha.

```bash
python3 build.py
```

Pillow já está instalado no Mac (11.3.0). O `build.py` atual não depende dele —
só de biblioteca padrão. Pillow volta a ser necessário se for mexer no atlas.

---

## 3. Publicação  ⟳ mudou

GitHub Pages, conta **Cyr-Consultoria**, repositório público
`mundo-luisa-k7q3` (Pages só funciona em repo público no plano gratuito).
Há `robots.txt` e `<meta name="robots" content="noindex">` — mas **quem tem o
link vê as fotos**.

Produção: <https://cyr-consultoria.github.io/mundo-luisa-k7q3/>

Antes era: gerar o arquivo, abrir o GitHub no navegador, arrastar o `index.html`.
Agora a chave SSH da conta já está no Mac e resolve por linha de comando:

```bash
./publicar.sh
```

O script faz, nessa ordem: `build.py` → `tests/smoke.js` → **para se algum teste
falhar** → commit → push. Aguardar ~1 min e conferir a URL.

Manual, se preferir:

```bash
python3 build.py && node tests/smoke.js && git add -A && git commit -m "..." && git push
```

**No iPad:** abrir o link no Safari → Compartilhar → Adicionar à Tela de Início.
Não funciona pelo app Arquivos: o QuickLook do iOS não executa JavaScript.

---

## 4. O motor do RPG (`src/rpg_block.js`)

IIFE que expõe `RPG`. Viewport interno 240×160 (resolução GBA) escalado por CSS com
`image-rendering: pixelated`. Loop em `requestAnimationFrame`.

### 4.1 Anatomia de um capítulo

Capítulos são dados puros no array `CAPS`. Para criar o capítulo 6, acrescente um
objeto — o motor não precisa mudar.

```js
const CAP6 = {
  id:'aurora-6', n:6, titulo:'...', subtitulo:'Capítulo 6 · ...',
  emoji:'🌟', cor:'#RRGGBB', resumo:'aparece no card do menu',
  objetivo:'texto da barra de objetivo',
  mapa:[ /* 16 strings de exatamente 20 caracteres */ ],
  inicio:{x,y},
  entrega:{x,y}, entregaTxt:'...',      // opcional: ponto final do capítulo
  escuro:true,                          // opcional: vinheta de escuridão (cap 2)
  vento:true,                           // opcional: rajadas empurram (cap 4)
  abre:{char:'B', meta:'ponte', tile:T.ponte},  // opcional: tile que destrava (cap 3)
  caixote:{x,y}, alvoCaixote:{x,y},     // opcional: puzzle de empurrar (cap 1)
  metas:[ {id, nome, icone, x, y, tile, acao, cfg, dica, antes, fala, noAlto, exigeTudo} ],
  npcs:[ {id, sprite, x, y, nome, cor, oculto, falas:{inicio,meio,fim}} ],
  abertura:[['LUÍSA','...']], final:[['LUÍSA','...']]
};
```

Ações disponíveis em `meta.acao`:

| ação | o que faz |
|---|---|
| `pegar` | item no chão; com `noAlto:true` exige o caixote posicionado |
| `falar` | conclui ao interagir (usado para "achar o Tobias") |
| `sequencia` | mini-jogo de memória de luzes · `cfg:{n:3}` |
| `musical` | mini-jogo de repetir notas · `cfg:{n:4}` |
| `deslizante` | quebra-cabeça sobre uma foto sorteada |
| `escolha` | pergunta de 2 respostas, ambas válidas · `cfg:{titulo,pergunta,a,b}` |
| `palavra` | Monta a Palavra · `cfg:{nivel:3\|4\|6}` |
| `numero` | Conta com a Luísa · `cfg:{nivel:1\|2\|3, n:3}` — n contas certas concluem |
| `final` | acender as 4 cores na ordem |

`escolha` era texto fixo do Reflexo dentro da função, e por isso só servia no
capítulo 3. Hoje aceita `cfg`; sem `cfg` ele cai no Reflexo de sempre.

`exigeTudo:true` = só fica disponível quando todas as outras metas estão feitas.

### 4.2 Legenda dos mapas

Cada mapa é uma lista de 16 linhas × 20 caracteres.
**O `build.py` quebra se o tamanho não bater.**

```
.  grama      ,  grama variante   =  caminho de terra   T  árvore*      a  arbusto
~  água*      P  parede*          J  janela*            D  porta        f  flor
1 2 3  telhado esquerda/meio/direita*                   #  cerca*
g  chão de floresta    F  árvore escura*
s  areia      b  ponte           B  ponte quebrada*     r  pedra*
m  chão de montanha    R  rocha*
c  piso de castelo     W  parede de castelo*  O  porta trancada*  X  tocha*
                                              (* = sólido, bloqueia passagem)
```

`O` deixa de bloquear quando a meta daquele tile é concluída. `cap.abre` faz um
caractere sólido virar transitável (a ponte do capítulo 3).

### 4.3 Dificuldade

```js
facil:   {seta:true,  baloes:true,  dicas:99, obj:true,  vel:760, extra:0, grid:3, ordemCores:true}
medio:   {seta:false, baloes:true,  dicas:3,  obj:true,  vel:560, extra:0, grid:3, ordemCores:false}
dificil: {seta:false, baloes:false, dicas:0,  obj:false, vel:420, extra:1, grid:4, ordemCores:false}
```

`seta` = seta guia amarela · `baloes` = "!" sobre NPC não conversado ·
`obj` = checklist detalhado (senão só "2 de 4") · `vel` = ritmo dos mini-jogos ·
`extra` = passos a mais nas sequências · `grid` = tamanho do deslizante.

### 4.4 Sistemas que resolvem travamento (não remova)

Cada um destes existe porque quebrou de verdade com a criança jogando:

1. **Auto-alinhamento de colisão** (`livreEm` + o bloco de correção em `passo()`).
   A caixa de colisão ocupa dois tiles quando ela está torta na grade, e o corredor
   simplesmente não aceitava a passagem. Sem isso, o capítulo 4 é intransponível.
2. **Seta guia com BFS** (`proximoPasso`). Aponta o próximo passo do caminho real,
   não a linha reta. Trata NPC como obstáculo — senão manda a criança entrar dentro
   da Mel.
3. **Botão 🪄 Arrumar caixote** + detecção de caixote entalado. O puzzle de empurrar
   do capítulo 1 podia ficar num canto sem saída — isso era um game over silencioso.
4. **Conclusão automática ao pisar no ponto final** (fim de `passo()`), além do botão A.
5. **Interação com a meta sob os pés**, não só de frente.
6. **Meta e sprite do NPC no mesmo tile.** Se separar, a criança aperta A na cara do
   personagem e não acontece nada. Foi exatamente o bug do Tobias.
7. **`#rpgMini` mora fora das views, junto do `#win`.** Dentro da `.rpgTela` ele era
   cortado pelo `overflow:hidden` — a 375px o viewport do RPG tem ~230px de altura e
   sumia metade das respostas e o botão Sair. Dentro da `.view` a animação de entrada
   ainda o prendia num containing block. Agora cobre a tela toda e **bloqueia o ←**:
   isso só é seguro porque todo mini-jogo tem `#mSair` (o `escolha` não precisa — as
   duas respostas concluem a meta). **Se criar mini-jogo novo, ele precisa de saída.**

### 4.5 Save

`localStorage`, chave `luisa_rpg_v2`:

```js
{ dif:'facil',
  done:['aurora-1','aurora-2'],   // capítulos concluídos (destrava o próximo)
  'aurora-1': {x,y,cx,cy,f:['sino'],fim:false,dicas:99} }
```

Mudou a estrutura? **Suba a versão da chave** (`_v3`) para não ler save velho e quebrar.

### 4.6 Ganchos de debug (usados nos testes)

`RPG._dbg()` estado · `RPG._tp(x,y,dir)` teletransporte · `RPG._a()` aperta A ·
`RPG._cap(i)` abre capítulo por índice · `RPG._dif(d)` troca dificuldade ·
`RPG._metas()` lista metas · `RPG._feito(id)` conclui meta ·
`RPG._rota()` alvo + próximo passo.

⚠️ `RPG` é `const` de escopo de script — **não está em `window`**. No Playwright,
use o identificador nu (`RPG._dbg()`), nunca `window.RPG`.

---

## 5. Pixel art (`src/atlas.png`)

Uma folha PNG de 4 KB. Linha de cima (y 0–23): personagens 16×24 — Luísa em 4 direções
× 2 quadros de caminhada (índices 0–7), Mel 8, Tobias 10, Vovó 12, Sombra 14.
Linha de baixo (y 24–39): tiles 16×16, índices 0–38, mapeados na constante `T` do motor.

Todo o atlas foi desenhado por código Python com PIL — retângulos e pontos, pixel a
pixel. ⟳ **O script gerador se perdeu com o container.** Hoje `atlas.png` é asset
versionado. Para arte nova: ou editar o PNG num editor de pixel art, ou reescrever a
função de desenho — e em qualquer caso registrar o índice novo em `T`.

**Regra que já mordeu:** contraste. A montanha nasceu com rocha e chão no mesmo cinza
e a trilha ficou invisível. Chão claro, obstáculo escuro.

---

## 6. Como as fotos foram obtidas

A Fototeca não tinha ninguém nomeado em "Pessoas". O caminho foi ler
`~/Pictures/Photos Library.photoslibrary/database/Photos.sqlite` (copiar antes,
o arquivo está em uso), agrupar por `ZDETECTEDFACE.ZPERSONFORFACE`, achar o cluster
com mais faces (era o 324, com 817), filtrar fotos em que ela aparece sozinha
(`count(faces)=1`), validar visualmente e recortar em quadrado centrado no rosto com
OpenCV (`haarcascade_frontalface_default` → `alt2` → `profileface` como fallback).

Originais em `~/Pictures/Photos Library.photoslibrary/originals/<inicial>/<UUID>.jpeg|heic`.
HEIC precisa de `pillow-heif`.

**As fotos são da filha do Cyr. Não subir foto nova sem autorização dele.**

---

## 7. Padrão de interface (obrigatório)

Identidade: **este app é do mundo da Luísa, não da Cyr Andrade.** Rosa, lilás,
creme, coroa. A camada de *craft* do `padrao-html-cyr` vale aqui; a **paleta dark
neon da casa não entra**. Ao editar cor, leia os tokens do `:root` e trabalhe
dentro deles.

- `--ease-out: cubic-bezier(.22,1,.36,1)` como padrão; `--ease-spring` só onde houve momentum
- Feedback no `:active` (nunca só `:hover` — não existe hover no iPad)
- Alvo de toque mínimo 44 px; `font-size` de input ≥ 16 px (senão o Safari dá zoom)
- Header translúcido com `backdrop-filter` e o prefixo `-webkit-`
- Stagger na entrada de listas via `--i`
- Os **três** blocos de preferência no fim do CSS: `prefers-reduced-motion`,
  `prefers-reduced-transparency` e `prefers-contrast` — não são opcionais
- Testar a 375 px de largura; nada de `overflow-x`
- `viewport-fit=cover` + `env(safe-area-inset-*)` por causa do notch

### Hierarquia de material — a regra de cor deste app

Descoberta medindo, em 2026-08-15: **os 7 cartões reprovavam em contraste AA**,
o pior a 1,37:1 (branco sobre o amarelo do Ateliê). Texto branco sobre cor clara
e alegre não passa em AA em lugar nenhum — escurecer o amarelo até passar virava
marrom e matava o tom do app. A saída foi separar por função:

| Papel | Superfície | Texto | Tokens |
|---|---|---|---|
| **Conteúdo** (cartão de jogo) | cor clara e viva | tinta escura | `--g1a`…`--g7b` + `--tx-cartao` |
| **Controle** (chip ativo, `.btn.pri`, botão A) | cor funda | branco | `--ctrl-a`, `--ctrl-b` |
| **Display em gradiente** (título da home) | creme | versões `-tx` da marca | `--rosa-tx`, `--lilas-tx`, `--turq-tx` |

As cores de marca originais (`--rosa`, `--lilas`, `--turq`) continuam válidas
como **preenchimento**; sobre creme elas dão 1,7–2,6:1 e **não servem como
texto** — para isso existem as versões `-tx`.

`tests/smoke.js` mede os 20 pares a cada rodada. Cor nova entra como token no
`:root` e o teste cobra o contraste — é por isso que a regra "zero hex solto"
existe aqui, e não por estética.

### Tela de abertura (`AB`, no `app_template.html`)

Cena de overworld em pixel art desenhada no `#abCanvas` com **o mesmo
`atlas.png` do RPG** — nenhum asset novo entrou no arquivo. Camadas, da mais
lenta para a mais rápida: nuvens (0,10) → morros (0,22 e 0,42) → árvores (0,55)
→ chão (1,0). A Luísa caminha no lugar em escala 2× e o chão passa por baixo.

Inspiração é de gênero, não de asset: parallax de overworld com a heroína
andando, "toque para começar" pulsando no rodapé (o PRESS START de fliperama) e
o beat de confirmação da escolha (character select).

Regras que já custaram um retrabalho cada:

- **Largura interna fixa em 240** (resolução GBA) e altura pela proporção do
  aparelho. Assim o pixel tem o mesmo tamanho que no RPG em qualquer tela.
- **O horizonte fica em 73% da altura.** Mais alto, o gramado vira um verde
  chapado ocupando 40% da tela; mais baixo, a Luísa some atrás do botão.
- **As árvores pisam numa faixa de grama, não no morro.** O tile de árvore
  carrega o próprio fundo; desenhado sobre o morro, aparecia um quadrado verde
  escuro em volta de cada uma. Por isso o chão começa uma linha acima do
  horizonte e as árvores são desenhadas depois dele.
- **A fanfarra toca ao dispensar, não ao abrir.** O iOS só libera áudio depois
  de um gesto — antes do primeiro toque não sai som nenhum.
- **`prefers-reduced-motion` desliga o loop**, não só as transições: o `AB` nem
  chama `requestAnimationFrame` e desenha um quadro parado.
- Em tela deitada o título subia até encostar na coroa da Luísa; há um
  `@media (min-aspect-ratio:1/1)` que empurra o bloco para cima.

### Motion

- **Origin-aware animation**: tocar um cartão grava `origemToque` e a tela nasce
  daquele ponto (`.from-origin` + `transform-origin` calculado no `irPara`).
  O voltar mantém o slide direcional — entrada e saída não precisam ser
  simétricas aqui porque o gesto de volta é o botão, não o cartão.
- **Materialize, don't just fade**: `#rpgMini` e `.win` entram com
  `@keyframes materializa` — o desfoque sobe junto com a opacidade.
- `#rpgMini`, `.win`, `#abertura` e o canvas de confete **moram fora das views**.
  Se voltarem para dentro, a animação de entrada da view vira containing block e
  prende os quatro — foi o que cortava o mini-jogo.
- **Character-select**: tocar um cartão acende `.confirmando` no `.menu` e
  `.escolhido` no cartão por 180 ms antes de trocar de tela.
  A regra precisa de `animation:none` — a entrada usa `cardIn … both`, e o
  fill-mode mantém os valores do último keyframe aplicados, que **vencem** a
  `opacity`/`transform` declaradas. Sem isso o beat não aparece e não dá erro.

---

## 8. Como testar antes de entregar  ⟳ mudou

Playwright instalado localmente (`npm i -D playwright` + `npx playwright install chromium`,
já feito — Chromium em `~/Library/Caches/ms-playwright/`). Não é mais `playwright-core`
com `executablePath` fixo do container.

```bash
node tests/smoke.js          # index.html local
node tests/smoke.js --prod   # a URL de produção
```

O script cobre o checklist mínimo e sai com código 1 se qualquer item falhar:

1. A abertura aparece, a cena é desenhada, o parallax anda, o toque dispensa e o
   loop é cancelado ao sair.
2. Home aparece com os 7 jogos, e o beat de confirmação da escolha funciona.
3. **Contraste**: 20 pares de token passam em AA, e os três blocos
   `prefers-*` estão presentes.
4. Os jogos 1–6 abrem e o Voltar fecha.
5. Monta a Palavra: rodada de 6 palavras completa nos 3 níveis.
6. Conta com a Luísa: rodada de 8 contas completa nos 3 níveis.
7. Errar no jogo de números não remove a opção certa.
8. As ações `palavra` e `numero` abrem o mini-jogo no mapa e o Sair fecha.
9. **Alcance real dos capítulos 6–10**: BFS pelo mapa a partir de `inicio`, conferindo
   que todas as metas e o ponto de entrega são alcançáveis a pé.
10. Os 10 capítulos concluem de ponta a ponta (via `RPG._feito`).
11. As 3 dificuldades iniciam.
12. Sair da Aventura volta ao menu de capítulos.
13. Sem `overflow-x` a 375, 820 e 1024 px.
14. Nenhum botão visível abaixo de 44 px de altura.
15. Zero `pageerror` e zero `console.error`.

Hoje são **54 verificações**. `palAlvo` e `numResposta` são globais de propósito —
é por elas que o teste sabe a resposta certa sem adivinhar.

Duas armadilhas que já custaram tempo ao escrever teste aqui:

- **A abertura cobre a tela no carregamento.** Todo teste precisa dispensá-la
  antes de tocar em qualquer coisa (`dispatchEvent('pointerdown')` em `#abertura`).
- **Meta com `antes:` abre diálogo antes do mini-jogo.** Um `_a()` só não abre nada;
  tem que apertar A até `#rpgMini.on` aparecer.
- **`RPG._dbg().x` já vem em tiles** (`jog.x/TS`), não em pixels. Dividir por 16 de
  novo joga o BFS em (1,1) e dá falso positivo.

Salva `tests/ultimo-teste.png` para conferência visual.

Ainda **a olho**, porque teste automatizado não pega: "Jogar de novo" e o avanço de
capítulo (já quebraram por `requestAnimationFrame` duplicado — cancelar o loop anterior
em `iniciar()`).

---

## 9. Estado atual e o que ficou de fora

**Pronto e publicado:** 6 jogos simples + RPG com **10 capítulos em 2 aventuras** +
3 dificuldades + save + progressão travada por capítulo + avanço automático.

### As duas aventuras

**1ª · As Quatro Cores** (capítulos 1–5) — Aurora perdeu as cores. Fecha com a Luísa
reconhecendo a Sombra como parte dela. **Arco encerrado: não estique.**

**2ª · O Mapa que Faltava** (capítulos 6–10) — Aurora recuperou as cores, mas está
perdendo os nomes e as contas. A Sombra vem junto, agora como companheira.

| # | Capítulo | Cenário | Metas |
|---|---|---|---|
| 6 | Porto das Letras | areia, píer, água | `palavra` ×3 (3, 4 e 6 letras) |
| 7 | Feira dos Números | vila, bancas | `numero` ×2 + `escolha` do troco |
| 8 | Caverna dos Ecos | montanha, `escuro:true` | `sequencia` ×2 + `palavra` |
| 9 | Jardim da Vovó | grama, flor | `deslizante` + `pegar` + `escolha` |
| 10 | Torre do Relógio | castelo, `T.cristal` | `numero` ×3 (o último com n:4) |

Decisões desta leva, para não refazer discussão:

- Os ids da 2ª aventura são `mapa-6` … `mapa-10` (os da 1ª são `aurora-N`).
- `T.cristal` (índice 38) estava desenhado no atlas e **nunca tinha sido usado**.
  O relógio do capítulo 10 é o destino dele.
- O save **não subiu para `_v3`** — a estrutura não mudou, só entraram mais ids
  em `done`. Quem já zerou os 5 primeiros continua com eles marcados.
- **Não existe `AVENTURAS` no código.** `montarMenu()` só itera `CAPS`; a divisão em
  duas aventuras é uma faixa visual (`.avSep`) inserida antes dos capítulos 1 e 6.
  Agrupar de verdade continua sendo trabalho novo.
- O capítulo 10 não tem `entrega`: a última meta conclui o capítulo direto.

**Não feito** (nada disso foi pedido — não faça sem o Cyr pedir):

- Trilha sonora; hoje só há efeitos sintetizados por Web Audio, sem arquivos
- Service worker / PWA offline real (hoje o Safari só guarda em cache)
- Uma 3ª aventura (capítulos 11+) — cabe no mesmo padrão: objeto novo em `CAPS`
- Repositório privado (exigiria GitHub Pro para manter o Pages funcionando)

---

## 10. Histórico de decisões (para não refazer discussão encerrada)

| Decisão | Por quê |
|---|---|
| Arquivo único com base64, sem CDN | abre offline e instantâneo no iPad |
| GitHub Pages em vez de arquivo local | o QuickLook do iOS não executa JS |
| Repo público | Pages não serve repo privado no plano gratuito; mitigado com noindex + URL aleatória |
| Pixel art por código, não imagem | atlas de 4 KB, edição versionável em texto |
| Fotos a 360 px q72 | derrubou o app de 1,13 MB para 0,71 MB sem perda visível |
| Sem combate, sem game over | público de 7 anos; errar repete o desafio mais devagar |
| Mini-jogos em overlay DOM, não no canvas | alvos de toque grandes e acessíveis de graça |
| ⟳ `icon.png` e `atlas.png` como asset | os geradores Python se perderam; asset garante rebuild idêntico ao publicado |
| ⟳ Publicar por `git push` | a chave SSH da conta já está no Mac; acabou o arrastar-arquivo |

---

## 11. Regras de trabalho com o Cyr

- Corrigir o que ele relatou. Achou outro problema? **Avisar, não consertar junto.**
- Precisão e agilidade. Não propor melhorias sem ele pedir.
- Não sabe com certeza? Dizer que não sabe. Não inferir.
- Testar antes de dizer que está pronto. Zero erro de console.
- **Nunca editar `index.html` à mão.**
