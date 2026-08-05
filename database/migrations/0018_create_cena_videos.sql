-- =====================================================
-- Migration: 0018_create_cena_videos.sql
-- Descrição : Criação da tabela de vídeos das cenas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE cena_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cena_id UUID NOT NULL,

    titulo TEXT,
    legenda TEXT,
    descricao TEXT,

    video_url TEXT NOT NULL,
    miniatura_url TEXT,

    reproducao_automatica BOOLEAN NOT NULL DEFAULT FALSE,
    reproducao_em_loop BOOLEAN NOT NULL DEFAULT FALSE,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_cena_videos_ordem_exibicao
        CHECK (ordem_exibicao > 0),

    CONSTRAINT fk_cena_videos_cena
        FOREIGN KEY (cena_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_cena_videos_cena
    ON cena_videos (cena_id);
