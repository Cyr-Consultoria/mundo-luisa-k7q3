#!/bin/bash
# Mundo da Luísa — build, teste e publicação.
#   ./publicar.sh "mensagem do commit"
# Para antes de publicar se qualquer teste falhar.
set -e
cd "$(dirname "$0")"

MSG="${1:-Atualiza o Mundo da Luísa}"

echo "▸ Gerando index.html"
python3 build.py

echo "▸ Testando"
node tests/smoke.js

if git diff --quiet && git diff --cached --quiet && [ -z "$(git status --porcelain)" ]; then
  echo "▸ Nada mudou — nada a publicar."
  exit 0
fi

echo "▸ Publicando"
git add -A
git commit -m "$MSG"
git push

echo
echo "✓ No ar em ~1 min: https://cyr-consultoria.github.io/mundo-luisa-k7q3/"
echo "  Conferir com: node tests/smoke.js --prod"
