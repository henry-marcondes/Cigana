#!/bin/bash

# ==========================================
# Executa migrations PostgreSQL
#
# Configuração do banco:
#   backend/.env
#
# Uso:
#   ./database/migrar.sh
#       Executa todas as migrations
#
#   ./database/migrar.sh database/migrations/0001_create_idiomas.sql
#       Executa apenas uma migration
# ==========================================

ENV_FILE="backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Erro: arquivo $ENV_FILE não encontrado."
    exit 1
fi

# Carrega as variáveis do .env
set -a
source "$ENV_FILE"
set +a

# Validação das variáveis necessárias
if [ -z "$DB_HOST" ] || \
   [ -z "$DB_PORT" ] || \
   [ -z "$DB_NAME" ] || \
   [ -z "$DB_USER" ] || \
   [ -z "$DB_PASSWORD" ]; then

    echo "Erro: variáveis de banco não configuradas no $ENV_FILE."
    echo "Necessárias:"
    echo "DB_HOST"
    echo "DB_PORT"
    echo "DB_NAME"
    echo "DB_USER"
    echo "DB_PASSWORD"
    exit 1
fi

PSQL="PGPASSWORD=\"$DB_PASSWORD\" psql -h \"$DB_HOST\" -p \"$DB_PORT\" -U \"$DB_USER\" -d \"$DB_NAME\" \-v ON_ERROR_STOP=1"

if [ -n "$1" ]; then
    echo "Executando migration: $1"
    eval "$PSQL -f \"$1\""
    exit $?
fi

echo "Executando todas as migrations..."

for arquivo in database/migrations/*.sql
do
    echo "----------------------------------------"
    echo "Executando: $(basename "$arquivo")"

    eval "$PSQL -f \"$arquivo\""

    if [ $? -ne 0 ]; then
        echo ""
        echo "Erro na migration."
        echo "Processo interrompido."
        exit 1
    fi
done

echo ""
echo "Todas as migrations foram executadas com sucesso."
