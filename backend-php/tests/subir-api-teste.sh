#!/usr/bin/env bash
# Sobe a API apontando para o banco de TESTE, na porta 8001.
# A API de desenvolvimento continua na 8000 e nunca é tocada por este script.
#
# Uso (a partir de backend-php/): bash tests/subir-api-teste.sh
set -euo pipefail

cd "$(dirname "$0")/.."   # raiz do backend-php

# Variáveis já presentes no ambiente têm prioridade sobre o .env (Dotenv imutável),
# então estas valem mesmo que o .env aponte para o banco de desenvolvimento.
# O MAIL_* falso (porta 1 recusa conexão) impede o envio de e-mail de verdade.
# variables_order=EGPCS faz o PHP preencher $_ENV, que o config.php usa.
DB_HOST=127.0.0.1 \
DB_NAME=epapirus_test \
DB_USER=epapirus_test \
DB_PASS=epapirus_test \
JWT_SECRET=epapirus-chave-jwt-somente-para-testes-2026 \
JWT_EXPIRATION=3600 \
MAIL_HOST=127.0.0.1 \
MAIL_PORT=1 \
MAIL_USER=teste \
MAIL_PASS=teste \
exec php -d variables_order=EGPCS -S localhost:8001
