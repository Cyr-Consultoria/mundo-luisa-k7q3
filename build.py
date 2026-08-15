#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mundo da Luísa — costura os pedaços de src/ num único index.html.

    python3 build.py

Marcadores em src/app_template.html:
    __ICON__   ícone da Tela de Início (src/icon.png em base64)
    __IMGS__   array JSON com as 20 fotos (src/fotos/f00..f19.jpg em base64)
    __ATLAS__  src/atlas.png em base64 (o prefixo data: já está no template)
    __RPGJS__  motor do RPG (src/rpg_block.js)

NUNCA edite index.html à mão — ele é gerado por este script.
"""
import base64, json, os, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(RAIZ, 'src')
FOTOS = os.path.join(SRC, 'fotos')
SAIDA = os.path.join(RAIZ, 'index.html')


def b64(caminho):
    with open(caminho, 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')


def erro(msg):
    print(f'✗ {msg}', file=sys.stderr)
    sys.exit(1)


def valida_mapas(js):
    """Cada mapa do RPG tem 16 linhas de exatamente 20 caracteres.
    O motor quebra silenciosamente se o tamanho não bater — melhor parar aqui."""
    import re
    problemas = []
    for bloco in re.finditer(r'mapa:\s*\[(.*?)\]', js, re.S):
        linhas = re.findall(r"'([^']*)'", bloco.group(1))
        if not linhas:
            continue
        n = js[:bloco.start()].count('\n') + 1
        if len(linhas) != 16:
            problemas.append(f'  linha {n}: mapa com {len(linhas)} linhas (esperado 16)')
        for i, l in enumerate(linhas):
            if len(l) != 20:
                problemas.append(f'  linha {n}, mapa[{i}]: {len(l)} caracteres (esperado 20)')
    if problemas:
        erro('mapas fora do padrão 16×20:\n' + '\n'.join(problemas))


def main():
    for p in (SRC, FOTOS,
              os.path.join(SRC, 'app_template.html'),
              os.path.join(SRC, 'rpg_block.js'),
              os.path.join(SRC, 'atlas.png'),
              os.path.join(SRC, 'icon.png')):
        if not os.path.exists(p):
            erro(f'faltando: {os.path.relpath(p, RAIZ)}')

    with open(os.path.join(SRC, 'app_template.html'), encoding='utf-8') as f:
        html = f.read()
    with open(os.path.join(SRC, 'rpg_block.js'), encoding='utf-8') as f:
        rpg = f.read().rstrip('\n')

    valida_mapas(rpg)

    fotos = sorted(f for f in os.listdir(FOTOS) if f.lower().endswith(('.jpg', '.jpeg')))
    if len(fotos) != 20:
        erro(f'src/fotos/ tem {len(fotos)} arquivos (esperado 20: f00..f19)')
    imgs = ['data:image/jpeg;base64,' + b64(os.path.join(FOTOS, f)) for f in fotos]

    for marcador in ('__ICON__', '__IMGS__', '__ATLAS__', '__RPGJS__'):
        if marcador not in html:
            erro(f'marcador {marcador} sumiu de src/app_template.html')

    html = html.replace('__ICON__', b64(os.path.join(SRC, 'icon.png')))
    html = html.replace('__IMGS__', json.dumps(imgs))
    html = html.replace('__ATLAS__', b64(os.path.join(SRC, 'atlas.png')))
    html = html.replace('__RPGJS__', rpg)

    with open(SAIDA, 'w', encoding='utf-8') as f:
        f.write(html)

    kb = os.path.getsize(SAIDA) / 1024
    print(f'✓ index.html gerado — {kb:,.0f} KB ({kb/1024:.2f} MB)'.replace(',', '.'))
    if kb > 900:
        print('  atenção: acima de 900 KB; considere recomprimir as fotos')


if __name__ == '__main__':
    main()
