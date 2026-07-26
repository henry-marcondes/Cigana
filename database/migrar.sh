#!/bin/bash

# ==========================================
# Executa migrations PostgreSQL
#
# Uso:
#   ./database/migrar.sh
#       Executa todas as migrations
#
#   ./database/migrar.sh database/migrations/0001_create_idiomas.sql
#       Executa apenas uma migration
# ==========================================

USUARIO="postgres"
BANCO="ciganas_db"
PASTA_MIGRATIONS="database/migrations"

if [ -n "$1" ]; then
    echo "Executando migration: $1"
    psql -U "$USUARIO" -d "$BANCO" -f "$1"
    exit $?
fi

echo "Executando todas as migrations..."

for arquivo in "$PASTA_MIGRATIONS"/*.sql
do
    echo "----------------------------------------"
    echo "Executando: $(basename "$arquivo")"
    psql -U "$USUARIO" -d "$BANCO" -f "$arquivo"

    if [ $? -ne 0 ]; then
        echo ""
        echo "Erro na migration."
        echo "Processo interrompido."
        exit 1
    fi
done

echo ""
echo "Todas as migrations foram executadas com sucesso."
