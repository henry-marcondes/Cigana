-- =====================================================
-- Migration: 0012_create_livro_autores.sql
-- Descrição : Relacionamento entre livros e autores
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE livro_autores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    livro_id UUID NOT NULL,
    autor_id UUID NOT NULL,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_livro_autores_livro_autor
        UNIQUE (livro_id, autor_id),

    CONSTRAINT fk_livro_autores_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_livro_autores_autor
        FOREIGN KEY (autor_id)
        REFERENCES autores(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT ck_livro_autores_ordem_exibicao
        CHECK (ordem_exibicao > 0)
);
