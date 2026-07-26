-- ============================================================
-- Migration: 0001_create_idiomas.sql
-- Descrição : Criação da tabela idiomas
-- Projeto   : Plataforma Cigana 
-- PostgreSQL: 16+
-- ============================================================

-- Extensão para geração de UUID
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE idiomas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(100) NOT NULL,
    nome_nativo VARCHAR(100) NOT NULL,

    codigo_iso_639_1 CHAR(2) NOT NULL,
    codigo_iso_639_2 CHAR(3),

    locale VARCHAR(10),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_idiomas_codigo_iso_639_1 UNIQUE (codigo_iso_639_1),
    CONSTRAINT uq_idiomas_codigo_iso_639_2 UNIQUE (codigo_iso_639_2),
    CONSTRAINT uq_idiomas_locale UNIQUE (locale)
);

COMMIT;
