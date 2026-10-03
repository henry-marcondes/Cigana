-- =====================================================
-- Migration: 0043_create_usuario_preferencias.sql
-- Descrição : Relacionamento entre usuários e preferências
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE usuario_preferencias (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,

    preferencia_id UUID NOT NULL,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_preferencias_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_usuario_preferencias_preferencia
        FOREIGN KEY (preferencia_id)
        REFERENCES preferencias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_usuario_preferencias
        UNIQUE (usuario_id, preferencia_id)

);

CREATE INDEX idx_usuario_preferencias_preferencia
    ON usuario_preferencias (preferencia_id);

COMMIT;
