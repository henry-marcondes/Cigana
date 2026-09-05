-- =====================================================
-- Migration: 0032_create_papeis.sql
-- Descrição : Criação dos papéis da plataforma
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE papeis (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(50) NOT NULL,

    codigo VARCHAR(50) NOT NULL,

    descricao VARCHAR(255),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_papeis_nome
        UNIQUE (nome),

    CONSTRAINT uq_papeis_codigo
        UNIQUE (codigo)

);

COMMIT;
