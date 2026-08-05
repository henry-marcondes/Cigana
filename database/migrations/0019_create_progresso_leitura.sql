-- =====================================================
-- Migration: 0019_create_progresso_leitura.sql
-- Descrição : Criação da tabela de progresso de leitura
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE progresso_leitura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,
    livro_id UUID NOT NULL,
    versao_livro SMALLINT NOT NULL DEFAULT 1,

    cena_atual_id UUID NOT NULL,

    percentual_concluido NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    concluido BOOLEAN NOT NULL DEFAULT FALSE,

    ultima_leitura_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_progresso_leitura_percentual
        CHECK (
            percentual_concluido >= 0
            AND percentual_concluido <= 100
        ),

    CONSTRAINT uk_progresso_leitura_usuario_livro
        UNIQUE (usuario_id, livro_id),

    CONSTRAINT fk_progresso_leitura_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_progresso_leitura_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_progresso_leitura_cena
        FOREIGN KEY (cena_atual_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_progresso_leitura_usuario
    ON progresso_leitura (usuario_id);

CREATE INDEX idx_progresso_leitura_livro
    ON progresso_leitura (livro_id);

CREATE INDEX idx_progresso_leitura_cena
    ON progresso_leitura (cena_atual_id);
