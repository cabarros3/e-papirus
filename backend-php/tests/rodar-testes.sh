#!/usr/bin/env bash
# Sobe a API de teste, roda o PHPUnit e encerra a API ao final.
# Uso (a partir de backend-php/): composer test
#   ou: bash tests/rodar-testes.sh [argumentos do phpunit]
set -uo pipefail

cd "$(dirname "$0")/.."   # raiz do backend-php

PORTA=8001
porta_aberta() { (echo > "/dev/tcp/127.0.0.1/${PORTA}") 2>/dev/null; }

# Se já houver algo na porta, não dá para garantir que aponta para o banco de teste.
if porta_aberta; then
  echo "Erro: já existe um servidor na porta ${PORTA}. Encerre-o antes de rodar os testes." >&2
  exit 1
fi

LOG="$(mktemp)"
bash tests/subir-api-teste.sh > "$LOG" 2>&1 &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null; wait "$API_PID" 2>/dev/null; rm -f "$LOG"' EXIT

# Espera a API responder (até ~5 s).
for _ in $(seq 1 50); do
  porta_aberta && break
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "A API de teste não subiu:" >&2
    cat "$LOG" >&2
    exit 1
  fi
  sleep 0.1
done

if ! porta_aberta; then
  echo "A API de teste não respondeu na porta ${PORTA}." >&2
  exit 1
fi

vendor/bin/phpunit "$@"
