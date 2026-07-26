#!/bin/bash

# ==========================================
# Executa um arquivo de seed no PostgreSQL
# Uso:
# ./database/seed.sh database/seeds/0001_seed_idiomas.sql
# ==========================================

USUARIO="postgres"
BANCO="ciganas_db"

if [ -z "$1" ]; then
    echo "Uso:"
    echo "./database/seed.sh caminho/do/arquivo.sql"
    exit 1
fi

psql -U "$USUARIO" -d "$BANCO" -f "$1"
