-- =====================================================
-- Migration: 0014_create_cenas.sql
-- Descrição : Criação da tabela de cenas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE cenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    capitulo_id UUID NOT NULL,

    titulo TEXT NOT NULL,
    slug TEXT NOT NULL,
    texto TEXT NOT NULL,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,
    cena_inicial BOOLEAN NOT NULL DEFAULT FALSE,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_cenas_capitulo_slug
        UNIQUE (capitulo_id, slug),

    CONSTRAINT ck_cenas_ordem_exibicao
        CHECK (ordem_exibicao > 0),

    CONSTRAINT fk_cenas_capitulo
        FOREIGN KEY (capitulo_id)
        REFERENCES capitulos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


CREATE UNIQUE INDEX uq_cenas_capitulo_inicial
    ON cenas (capitulo_id)
    WHERE cena_inicial = TRUE;
