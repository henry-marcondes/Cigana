-- =====================================================
-- Migration: 0042_create_preferencias.sql
-- Descrição : Criação do catálogo de preferências dos usuários
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE preferencias (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grupo VARCHAR(50) NOT NULL,

    codigo VARCHAR(100) NOT NULL,

    nome VARCHAR(150) NOT NULL,

    descricao TEXT,

    ordem_exibicao INTEGER NOT NULL DEFAULT 0,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_preferencias_grupo_codigo
        UNIQUE (grupo, codigo)

);

CREATE INDEX idx_preferencias_grupo
    ON preferencias (grupo);

CREATE INDEX idx_preferencias_ativo
    ON preferencias (ativo);

COMMIT;
