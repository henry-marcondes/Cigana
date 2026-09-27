#!/bin/bash

# ==========================================
# Executa um arquivo de seed no PostgreSQL
#
# Configuração do banco:
#   backend/.env
#
# Uso:
#   ./database/seed.sh database/seeds/0001_seed_idiomas.sql
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

# Validação do arquivo de seed
if [ -z "$1" ]; then
    echo "Uso:"
    echo "./database/seed.sh caminho/do/arquivo.sql"
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "Erro: arquivo de seed não encontrado: $1"
    exit 1
fi

PSQL="PGPASSWORD=\"$DB_PASSWORD\" psql \
    -h \"$DB_HOST\" \
    -p \"$DB_PORT\" \
    -U \"$DB_USER\" \
    -d \"$DB_NAME\" \
    -v ON_ERROR_STOP=1"

echo "Executando seed: $1"

eval "$PSQL -f \"$1\""

if [ $? -ne 0 ]; then
    echo ""
    echo "Erro na execução do seed."
    exit 1
fi

echo ""
echo "Seed executado com sucesso."
