-- =====================================================
-- Migration: 0030_create_telefones.sql
-- Descrição : Criação dos telefones das pessoas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE telefones (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    pessoa_id UUID NOT NULL,

    tipo VARCHAR(20) NOT NULL,

    codigo_pais VARCHAR(5) NOT NULL DEFAULT '55',

    ddd VARCHAR(3),

    numero VARCHAR(20) NOT NULL,

    numero_normalizado VARCHAR(20) NOT NULL,

    principal BOOLEAN NOT NULL DEFAULT FALSE,

    verificado BOOLEAN NOT NULL DEFAULT FALSE,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_telefones_pessoa
        FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT ck_telefones_tipo
        CHECK (
            tipo IN (
                'CELULAR',
                'FIXO',
                'COMERCIAL',
                'OUTRO'
            )
        ),

    CONSTRAINT uq_telefones_numero_normalizado
        UNIQUE (pessoa_id, numero_normalizado)

);

CREATE UNIQUE INDEX uq_telefones_pessoa_principal
    ON telefones (pessoa_id)
    WHERE principal = TRUE
      AND ativo = TRUE;

CREATE INDEX idx_telefones_pessoa_id
    ON telefones (pessoa_id);

COMMIT;
