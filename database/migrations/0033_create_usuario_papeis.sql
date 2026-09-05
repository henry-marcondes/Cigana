-- =====================================================
-- Migration: 0033_create_usuario_papeis.sql
-- Descrição : Relacionamento entre usuários e papéis
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE usuario_papeis (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,

    papel_id UUID NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_usuario_papeis_usuario_papel
        UNIQUE (usuario_id, papel_id),

    CONSTRAINT fk_usuario_papeis_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_usuario_papeis_papel
        FOREIGN KEY (papel_id)
        REFERENCES papeis(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

CREATE INDEX idx_usuario_papeis_usuario_id
    ON usuario_papeis (usuario_id);

CREATE INDEX idx_usuario_papeis_papel_id
    ON usuario_papeis (papel_id);

COMMIT;
