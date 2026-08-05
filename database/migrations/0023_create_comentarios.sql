-- =====================================================
-- Migration: 0021_create_comentarios.sql
-- Descrição : Criação da tabela de favoritos dos livros
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================
CREATE TABLE comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,
    livro_id UUID NOT NULL,

    texto TEXT NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comentarios_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comentarios_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_comentarios_usuario_id
    ON comentarios(usuario_id);


CREATE INDEX idx_comentarios_livro_id
    ON comentarios(livro_id);
