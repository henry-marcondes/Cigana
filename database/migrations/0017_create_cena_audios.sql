-- =====================================================
-- Migration: 0017_create_cena_audios.sql
-- Descrição : Criação da tabela de áudios das cenas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE cena_audios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cena_id UUID NOT NULL,

    titulo TEXT,
    legenda TEXT,
    descricao TEXT,
    audio_url TEXT NOT NULL,

    reproducao_automatica BOOLEAN NOT NULL DEFAULT FALSE,
    reproducao_em_loop BOOLEAN NOT NULL DEFAULT FALSE,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_cena_audios_ordem_exibicao
        CHECK (ordem_exibicao > 0),

    CONSTRAINT fk_cena_audios_cena
        FOREIGN KEY (cena_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_cena_audios_cena
    ON cena_audios (cena_id);
