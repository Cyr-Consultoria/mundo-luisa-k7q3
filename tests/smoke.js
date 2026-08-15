#!/usr/bin/env node
/**
 * Checklist mínimo de entrega do Mundo da Luísa (PROMPT-CONTINUIDADE §8).
 *
 *   node tests/smoke.js            testa o index.html local
 *   node tests/smoke.js --prod     testa a URL de produção
 *
 * Falha com exit code 1 se qualquer item quebrar.
 */
const { chromium } = require('playwright');
const path = require('path');

const PROD = 'https://cyr-consultoria.github.io/mundo-luisa-k7q3/';
const ALVO = process.argv.includes('--prod')
  ? PROD
  : 'file://' + path.resolve(__dirname, '..', 'index.html');

const erros = [];
const falhas = [];
let passos = 0;

function ok(nome)          { passos++; console.log(`  ✓ ${nome}`); }
function falha(nome, det)  { falhas.push(`${nome}${det ? ' — ' + det : ''}`); console.log(`  ✗ ${nome}${det ? ' — ' + det : ''}`); }
function checa(cond, nome, det) { cond ? ok(nome) : falha(nome, det); }

(async () => {
  console.log(`\nMundo da Luísa · ${ALVO}\n`);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 400, height: 1000 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => erros.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') erros.push('console.error: ' + m.text()); });

  await p.goto(ALVO, { waitUntil: 'load' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(600);

  // ---------- 1. Tela de início ----------
  console.log('1) Tela de início');
  checa(await p.locator('#vHome.on').isVisible(), 'Home aparece');
  checa(await p.locator('[data-go]').count() === 7, 'os 7 jogos estão no menu');

  // ---------- 2. Os jogos simples abrem e o Voltar fecha ----------
  console.log('\n2) Jogos 1–6 abrem e voltam');
  for (const [go, nome] of [['vMem', 'Memória'], ['vPuz', 'Quebra-cabeça'],
                            ['vDif', 'Diferenças'], ['vAte', 'Ateliê'],
                            ['vPal', 'Monta a Palavra'], ['vNum', 'Conta com a Luísa']]) {
    await p.click(`[data-go="${go}"]`);
    await p.waitForTimeout(450);
    const abriu = await p.locator(`#${go}.on`).isVisible();
    await p.click('#btnBack');
    await p.waitForTimeout(450);
    const voltou = await p.locator('#vHome.on').isVisible();
    checa(abriu && voltou, `${nome}: abre e volta`, abriu ? 'não voltou' : 'não abriu');
  }

  // ---------- 2b. Monta a Palavra: joga uma rodada inteira ----------
  console.log('\n2b) Monta a Palavra — rodada completa nos 3 níveis');
  for (const [nivel, rotulo] of [['3', 'fácil'], ['4', 'médio'], ['6', 'difícil']]) {
    await p.click('[data-go="vPal"]');
    await p.waitForTimeout(400);
    await p.click(`#palChips .chip[data-n="${nivel}"]`);
    await p.waitForTimeout(400);

    let palavras = 0;
    for (let r = 0; r < 6; r++) {
      // resolve pela dica: ela sempre trava a próxima letra certa
      for (let k = 0; k < 8; k++) {
        if (await p.locator('#win.on').isVisible()) break;
        const vazios = await p.locator('#palSlots .palSlot:not(.cheio)').count();
        if (vazios === 0) break;
        await p.click('#palDica');
        await p.waitForTimeout(140);
      }
      await p.waitForTimeout(1100);
      palavras++;
      if (await p.locator('#win.on').isVisible()) break;
    }
    const ganhou = await p.locator('#win.on').isVisible();
    const acertos = await p.locator('#palAcertos').textContent();
    checa(ganhou && acertos === '6', `palavras ${rotulo}: 6 palavras montadas`,
          ganhou ? `acertou ${acertos}` : `travou na palavra ${palavras}`);
    await p.click('#winHome');
    await p.waitForTimeout(450);
  }

  // ---------- 2c. Conta com a Luísa: joga uma rodada inteira ----------
  console.log('\n2c) Conta com a Luísa — rodada completa nos 3 níveis');
  for (const [nivel, rotulo] of [['1', 'contar'], ['2', 'até 10'], ['3', 'até 20']]) {
    await p.click('[data-go="vNum"]');
    await p.waitForTimeout(400);
    await p.click(`#numChips .chip[data-n="${nivel}"]`);
    await p.waitForTimeout(400);

    let ok = true;
    for (let q = 0; q < 8; q++) {
      if (await p.locator('#win.on').isVisible()) break;
      // a resposta certa é a única que bate com a pergunta — calcula pelo enunciado
      const alvo = await p.evaluate(() => numResposta);
      const botao = p.locator('.numOpc', { hasText: new RegExp(`^${alvo}$`) }).first();
      if (await botao.count() === 0) { ok = false; break; }
      await botao.click();
      await p.waitForTimeout(1050);
    }
    const ganhou = await p.locator('#win.on').isVisible();
    const acertos = await p.locator('#numAcertos').textContent();
    checa(ok && ganhou && acertos === '8', `números ${rotulo}: 8 contas certas`,
          ganhou ? `acertou ${acertos}` : 'não chegou ao fim');
    await p.click('#winHome');
    await p.waitForTimeout(450);
  }

  // ---------- 2d. Errar não pune ----------
  console.log('\n2d) Errar não trava nem pune');
  await p.click('[data-go="vNum"]');
  await p.waitForTimeout(450);
  const errado = await p.evaluate(() => {
    const b = [...document.querySelectorAll('.numOpc')].find(x => +x.textContent !== numResposta);
    b.click();
    return { certaAindaExiste: [...document.querySelectorAll('.numOpc')]
      .some(x => +x.textContent === numResposta && x.style.pointerEvents !== 'none') };
  });
  checa(errado.certaAindaExiste, 'erro no jogo de números não tira a opção certa');
  await p.click('#btnBack');
  await p.waitForTimeout(400);

  // ---------- 3. RPG: os 10 capítulos concluem ----------
  console.log('\n3) Aventura — 10 capítulos de ponta a ponta');
  await p.click('[data-go="vRpg"]');
  await p.waitForTimeout(500);
  checa(await p.locator('#vRpg.on').isVisible(), 'menu da Aventura abre');
  checa(await p.locator('#rpgMenu .avSep').count() === 2, 'as 2 aventuras aparecem separadas no menu');

  // RPG é const de escopo de script: existe como identificador, não em window.
  const ganchos = await p.evaluate(() => {
    try { return ['_dbg', '_tp', '_a', '_cap', '_dif', '_metas', '_feito', '_rota']
            .every(k => typeof RPG[k] === 'function'); }
    catch (e) { return false; }
  });
  checa(ganchos, 'ganchos de debug do RPG disponíveis');

  // ---------- 3b. As ações novas abrem de verdade ----------
  console.log('\n3b) Ações palavra e numero abrem o mini-jogo');
  for (const [capIdx, acao, rotulo] of [[5, 'palavra', 'cap 6 · palavra'],
                                        [6, 'numero',  'cap 7 · numero']]) {
    const r = await p.evaluate(async ({ i, a }) => {
      RPG._cap(i);
      await new Promise(r => setTimeout(r, 400));
      const meta = RPG._metas().find(m => m.acao === a);
      if (!meta) return { erro: 'meta não existe' };
      RPG._tp(meta.x, meta.y);
      await new Promise(r => setTimeout(r, 200));
      // metas com `antes:` abrem diálogo primeiro; o A avança até o mini-jogo
      for (let k = 0; k < 10 && !document.querySelector('#rpgMini.on'); k++) {
        RPG._a();
        await new Promise(r => setTimeout(r, 260));
      }
      const box = document.querySelector('#rpgMini.on .miniBox');
      const alvos = a === 'palavra'
        ? document.querySelectorAll('#rpgMini .palLetra').length
        : document.querySelectorAll('#rpgMini .numOpc').length;
      const sair = document.querySelector('#rpgMini #mSair');
      if (sair) sair.click();
      await new Promise(r => setTimeout(r, 300));
      return { abriu: !!box, alvos, fechou: !document.querySelector('#rpgMini.on') };
    }, { i: capIdx, a: acao });
    checa(r.abriu && r.alvos > 0 && r.fechou,
          `${rotulo}: abre com ${r.alvos} alvos e o Sair fecha`, JSON.stringify(r));
  }

  // ---------- 3c. Dá para CHEGAR em tudo? ----------
  // _feito conclui a meta sem andar pelo mapa. Sem isto, um alvo murado passa batido
  // e a criança fica presa — que é a única falha que o app não pode ter.
  console.log('\n3c) Alcance real dos capítulos novos (BFS pelo mapa)');
  for (let i = 5; i < 10; i++) {
    const r = await p.evaluate(async (idx) => {
      RPG._cap(idx);
      await new Promise(r => setTimeout(r, 350));
      const mapa = RPG._mapa();
      const d = RPG._dbg();
      const SOL = new Set('T~PJ#123FBrRWOX'.split(''));
      const H = mapa.length, W = mapa[0].length;
      const livre = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !SOL.has(mapa[y][x]);
      // _dbg().x já vem em tiles (jog.x/TS) — dividir de novo por 16 põe o BFS em (1,1)
      const ini = d.inicio || { x: Math.round(d.x), y: Math.round(d.y) };
      const vistos = new Set([ini.x + ',' + ini.y]);
      const fila = [ini];
      while (fila.length) {
        const c = fila.shift();
        for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
          const nx = c.x + dx, ny = c.y + dy, k = nx + ',' + ny;
          if (!vistos.has(k) && livre(nx, ny)) { vistos.add(k); fila.push({ x: nx, y: ny }); }
        }
      }
      const alvos = RPG._metas().map(m => ({ nome: m.id, x: m.x, y: m.y }));
      if (d.entrega) alvos.push({ nome: 'ponto de entrega', x: d.entrega.x, y: d.entrega.y });
      const presos = alvos.filter(a => !vistos.has(a.x + ',' + a.y));
      return { inicioLivre: livre(ini.x, ini.y), presos: presos.map(a => a.nome), total: alvos.length };
    }, i);
    checa(r.inicioLivre && r.presos.length === 0,
          `capítulo ${i + 1}: os ${r.total} alvos são alcançáveis a pé`,
          r.inicioLivre ? 'sem caminho até ' + r.presos.join(', ') : 'início em cima de tile sólido');
  }

  for (let i = 0; i < 10; i++) {
    const r = await p.evaluate(async (idx) => {
      RPG._cap(idx);
      await new Promise(r => setTimeout(r, 350));
      const metas = RPG._metas();
      for (const m of metas) RPG._feito(m.id);
      await new Promise(r => setTimeout(r, 350));
      const d = RPG._dbg();
      return { metas: metas.length, feitas: (d.feitos || d.f || []).length, fim: !!d.fim, cap: d.cap || d.id };
    }, i);
    checa(r.metas > 0 && r.feitas >= r.metas,
          `capítulo ${i + 1}: ${r.feitas}/${r.metas} metas concluídas`,
          `só ${r.feitas} de ${r.metas}`);
    await p.waitForTimeout(250);
  }

  // ---------- 4. Dificuldades ----------
  console.log('\n4) Dificuldades');
  for (const d of ['facil', 'medio', 'dificil']) {
    const r = await p.evaluate(async (dd) => {
      RPG._dif(dd); RPG._cap(0);
      await new Promise(r => setTimeout(r, 300));
      return !!RPG._dbg();
    }, d);
    checa(r, `dificuldade ${d} inicia o capítulo 1`);
  }

  // ---------- 5. Sair do RPG ----------
  console.log('\n5) Sair da Aventura');
  await p.evaluate(() => RPG.voltarMenu());
  await p.waitForTimeout(400);
  checa(await p.locator('#rpgMenuWrap').isVisible(), 'volta para o menu de capítulos');

  // ---------- 6. Layout: sem overflow-x ----------
  console.log('\n6) Layout');
  for (const w of [375, 820, 1024]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.waitForTimeout(300);
    const over = await p.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    checa(over <= 0, `sem overflow-x a ${w}px`, `sobra ${over}px`);
  }

  // ---------- 7. Alvos de toque ----------
  await p.setViewportSize({ width: 375, height: 900 });
  await p.click('#btnBack').catch(() => {});
  await p.waitForTimeout(400);
  const pequenos = await p.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter(b => b.offsetParent !== null)
      .map(b => ({ id: b.id || b.className, h: Math.round(b.getBoundingClientRect().height) }))
      .filter(b => b.h > 0 && b.h < 44));
  checa(pequenos.length === 0, 'alvos de toque ≥ 44px',
        pequenos.map(x => `${x.id}:${x.h}px`).join(', '));

  // ---------- 8. Console ----------
  console.log('\n7) Console');
  checa(erros.length === 0, 'zero erro de console', erros.slice(0, 5).join(' | '));

  await p.screenshot({ path: path.resolve(__dirname, 'ultimo-teste.png'), fullPage: false });
  await b.close();

  console.log(`\n${'─'.repeat(52)}`);
  if (falhas.length) {
    console.log(`✗ ${falhas.length} falha(s) de ${passos + falhas.length} verificações:`);
    falhas.forEach(f => console.log('   · ' + f));
    process.exit(1);
  }
  console.log(`✓ ${passos} verificações passaram. Pode publicar.`);
})();
