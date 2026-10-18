#!/usr/bin/env bash
# Recria o banco de teste do zero (schema + seeds).
# Usa SEMPRE o usuário epapirus_test, que só tem acesso ao banco epapirus_test.
set -euo pipefail

BANCO="epapirus_test"
USUARIO="epapirus_test"
export MYSQL_PWD="epapirus_test"
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"

mysql -u "$USUARIO" -e "DROP DATABASE IF EXISTS $BANCO; CREATE DATABASE $BANCO CHARACTER SET utf8mb4;"

for arquivo in db/db.sql db/seed.sql; do
  sed -E '/^(CREATE DATABASE|USE) /d' "$RAIZ/$arquivo" | mysql -u "$USUARIO" "$BANCO"
done

echo "Banco $BANCO recriado com sucesso."
