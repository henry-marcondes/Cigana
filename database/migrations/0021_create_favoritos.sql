-- =====================================================
-- Migration: 0021_create_favoritos.sql
-- Descrição : Criação da tabela de favoritos dos livros
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,
    livro_id UUID NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_favoritos_usuario_livro
        UNIQUE (usuario_id, livro_id),

    CONSTRAINT fk_favoritos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_favoritos_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_favoritos_usuario
    ON favoritos (usuario_id);

CREATE INDEX idx_favoritos_livro
    ON favoritos (livro_id);
