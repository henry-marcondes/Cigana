-- =====================================================
-- Migration: 0025_create_cena_textos.sql
-- Descrição : Criação dos textos das cenas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE cena_textos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cena_id UUID NOT NULL,

    texto_url TEXT NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cena_textos_cena
        FOREIGN KEY (cena_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_cena_textos_cena
    ON cena_textos (cena_id);
