-- =====================================================
-- Migration: 0020_create_marcadores.sql
-- Descrição : Criação da tabela de marcadores de leitura
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE marcadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,
    livro_id UUID NOT NULL,
    cena_id UUID NOT NULL,

    titulo TEXT,
    observacao TEXT,
    categoria TEXT,

    ordem_exibicao INTEGER NOT NULL DEFAULT 1,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_marcadores_ordem_exibicao
        CHECK (ordem_exibicao > 0),

    CONSTRAINT fk_marcadores_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_marcadores_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_marcadores_cena
        FOREIGN KEY (cena_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_marcadores_usuario
    ON marcadores (usuario_id);

CREATE INDEX idx_marcadores_livro
    ON marcadores (livro_id);

CREATE INDEX idx_marcadores_cena
    ON marcadores (cena_id);

CREATE INDEX idx_marcadores_usuario_livro
    ON marcadores (usuario_id, livro_id);
