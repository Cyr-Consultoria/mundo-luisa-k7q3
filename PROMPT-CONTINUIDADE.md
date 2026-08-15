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

Aplicação web com 5 jogos, feita para uma criança de 7 anos, usando fotos reais dela.
Arquivo único, sem servidor de aplicação, sem framework, sem dependência externa em
runtime. Só um script Python costura os pedaços.

| # | Jogo | Mecânica |
|---|---|---|
| 1 | Jogo da Memória | pares com as fotos · 6/8/10 pares |
| 2 | Quebra-cabeça | deslizante 3×3 e 4×4 sobre uma foto |
| 3 | Ache as Diferenças | adesivos sorteados sobre a foto · 3/5/7 |
| 4 | Ateliê de Adesivos | canvas com adesivos arrastáveis, exporta PNG |
| 5 | Aventura de Luísa | RPG top-down 16-bit, 5 capítulos, 3 dificuldades |

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
    ├── app_template.html   casca: HTML, CSS e JS dos jogos 1–4  (43 KB)
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
| `escolha` | pergunta de 2 respostas, ambas válidas |
| `final` | acender as 4 cores na ordem |

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

- `--ease-out: cubic-bezier(.22,1,.36,1)` como padrão; `--ease-spring` só onde houve momentum
- Feedback no `:active` (nunca só `:hover` — não existe hover no iPad)
- Alvo de toque mínimo 44 px; `font-size` de input ≥ 16 px (senão o Safari dá zoom)
- Header translúcido com `backdrop-filter` e o prefixo `-webkit-`
- Stagger na entrada de listas via `--i`
- Bloco `@media (prefers-reduced-motion: reduce)` no fim do CSS — não é opcional
- Testar a 375 px de largura; nada de `overflow-x`
- `viewport-fit=cover` + `env(safe-area-inset-*)` por causa do notch

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

1. Home aparece com os 5 jogos.
2. Os jogos 1–4 abrem e o Voltar fecha.
3. Os 5 capítulos concluem de ponta a ponta (via `RPG._feito`).
4. As 3 dificuldades iniciam.
5. Sair da Aventura volta ao menu de capítulos.
6. Sem `overflow-x` a 375, 820 e 1024 px.
7. Nenhum botão visível abaixo de 44 px de altura.
8. Zero `pageerror` e zero `console.error`.

Salva `tests/ultimo-teste.png` para conferência visual.

Ainda **a olho**, porque teste automatizado não pega: "Jogar de novo" e o avanço de
capítulo (já quebraram por `requestAnimationFrame` duplicado — cancelar o loop anterior
em `iniciar()`).

---

## 9. Estado atual e o que ficou de fora

**Pronto e publicado:** 4 jogos simples + RPG com 5 capítulos + 3 dificuldades + save +
progressão travada por capítulo + avanço automático para o capítulo seguinte.
Rebuild local confere byte a byte com produção.

**Não feito** (nada disso foi pedido — não faça sem o Cyr pedir):

- Trilha sonora; hoje só há efeitos sintetizados por Web Audio, sem arquivos
- Service worker / PWA offline real (hoje o Safari só guarda em cache)
- Mais aventuras além de "As Quatro Cores" — a estrutura `AVENTURAS` já suporta
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
