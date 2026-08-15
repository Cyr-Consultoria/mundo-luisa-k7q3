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
  checa(await p.locator('[data-go]').count() === 5, 'os 5 jogos estão no menu');

  // ---------- 2. Os 4 jogos simples abrem e o Voltar fecha ----------
  console.log('\n2) Jogos 1–4 abrem e voltam');
  for (const [go, nome] of [['vMem', 'Memória'], ['vPuz', 'Quebra-cabeça'],
                            ['vDif', 'Diferenças'], ['vAte', 'Ateliê']]) {
    await p.click(`[data-go="${go}"]`);
    await p.waitForTimeout(450);
    const abriu = await p.locator(`#${go}.on`).isVisible();
    await p.click('#btnBack');
    await p.waitForTimeout(450);
    const voltou = await p.locator('#vHome.on').isVisible();
    checa(abriu && voltou, `${nome}: abre e volta`, abriu ? 'não voltou' : 'não abriu');
  }

  // ---------- 3. RPG: os 5 capítulos concluem ----------
  console.log('\n3) Aventura — 5 capítulos de ponta a ponta');
  await p.click('[data-go="vRpg"]');
  await p.waitForTimeout(500);
  checa(await p.locator('#vRpg.on').isVisible(), 'menu da Aventura abre');

  // RPG é const de escopo de script: existe como identificador, não em window.
  const ganchos = await p.evaluate(() => {
    try { return ['_dbg', '_tp', '_a', '_cap', '_dif', '_metas', '_feito', '_rota']
            .every(k => typeof RPG[k] === 'function'); }
    catch (e) { return false; }
  });
  checa(ganchos, 'ganchos de debug do RPG disponíveis');

  for (let i = 0; i < 5; i++) {
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
