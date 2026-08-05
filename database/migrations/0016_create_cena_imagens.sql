-- =====================================================
-- Migration: 0016_create_cena_imagens.sql
-- Descrição : Criação da tabela de imagens das cenas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE cena_imagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cena_id UUID NOT NULL,

    titulo TEXT,
    legenda TEXT,
    texto_alternativo TEXT,
    imagem_url TEXT NOT NULL,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_cena_imagens_ordem_exibicao
        CHECK (ordem_exibicao > 0),

    CONSTRAINT fk_cena_imagens_cena
        FOREIGN KEY (cena_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_cena_imagens_cena
    ON cena_imagens (cena_id);
