-- =====================================================
-- Migration: 0021_create_avaliacoes.sql
-- Descrição : Criação da tabela de favoritos dos livros
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================
CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,
    livro_id UUID NOT NULL,

    nota SMALLINT NOT NULL,
    comentario TEXT,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_avaliacoes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_avaliacoes_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_avaliacoes_nota
        CHECK (nota BETWEEN 1 AND 5),

    CONSTRAINT uq_avaliacoes_usuario_livro
        UNIQUE(usuario_id, livro_id)
);


CREATE INDEX idx_avaliacoes_usuario_id
    ON avaliacoes(usuario_id);


CREATE INDEX idx_avaliacoes_livro_id
    ON avaliacoes(livro_id);
