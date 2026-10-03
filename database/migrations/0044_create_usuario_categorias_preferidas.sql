-- =====================================================
-- Migration: 0044_create_usuario_categorias_preferidas.sql
-- Descrição : Relacionamento entre usuários e categorias
--             preferidas (gêneros literários)
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE usuario_categorias_preferidas (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,

    categoria_id UUID NOT NULL,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_categorias_preferidas_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_usuario_categorias_preferidas_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_usuario_categorias_preferidas
        UNIQUE (usuario_id, categoria_id)

);

CREATE INDEX idx_usuario_categorias_preferidas_categoria
    ON usuario_categorias_preferidas (categoria_id);

COMMIT;
