-- =====================================================
-- Migration: 0013_create_capitulos.sql
-- Descrição : Criação da tabela de capítulos
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE capitulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    livro_id UUID NOT NULL,

    titulo TEXT NOT NULL,
    slug TEXT NOT NULL,

    resumo TEXT,
    texto_introdutorio TEXT,
    capa_url TEXT,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_capitulos_livro_slug
        UNIQUE (livro_id, slug),

    CONSTRAINT ck_capitulos_ordem_exibicao
        CHECK (ordem_exibicao > 0),

    CONSTRAINT fk_capitulos_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
