-- =====================================================
-- Migration: 0015_create_escolhas.sql
-- Descrição : Criação da tabela de escolhas narrativas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE escolhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cena_origem_id UUID NOT NULL,
    cena_destino_id UUID,

    texto TEXT NOT NULL,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_escolhas_ordem_exibicao
        CHECK (ordem_exibicao > 0),

    CONSTRAINT fk_escolhas_cena_origem
        FOREIGN KEY (cena_origem_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_escolhas_cena_destino
        FOREIGN KEY (cena_destino_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


CREATE INDEX idx_escolhas_cena_origem
    ON escolhas (cena_origem_id);


CREATE INDEX idx_escolhas_cena_destino
    ON escolhas (cena_destino_id);
