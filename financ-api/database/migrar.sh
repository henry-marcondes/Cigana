#!/usr/bin/env bash
# ==========================================
# Executa migrations PostgreSQL
#
# Configuração do banco:
#   financ-api/.env
#
# Uso:
#   ./database/migrar.sh
#       Executa todas as migrations
#
#   ./database/migrar.sh database/migrations/0001_create_idiomas.sql
#       Executa apenas uma migration
# ==========================================

set -u

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
FINANC_API_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$FINANC_API_DIR/.env"
MIGRATION_EXECUTOR="$FINANC_API_DIR/scripts/migrate.js"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "Erro: arquivo financ-api/.env não encontrado." >&2
    echo "Crie-o a partir de financ-api/.env.example e configure FINANC_API_DB_*." >&2
    exit 1
fi

if [[ ! -f "$MIGRATION_EXECUTOR" ]]; then
    echo "Erro: executor de migrations da financ-api não encontrado." >&2
    exit 1
fi

echo "Iniciando migrations da financ-api no banco financeiro_db..."

if (cd -- "$FINANC_API_DIR" && node "$MIGRATION_EXECUTOR"); then
    echo "Migrations da financ-api concluídas."
else
    status=$?
    echo "Erro: migrations não concluídas. Verifique FINANC_API_DB_HOST, FINANC_API_DB_PORT, FINANC_API_DB_NAME=financeiro_db, FINANC_API_DB_USER, FINANC_API_DB_PASSWORD e a disponibilidade do banco." >&2
    exit "$status"
fi
