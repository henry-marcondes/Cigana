-- =====================================================
-- Migration: 0031_create_enderecos.sql
-- Descrição : Criação dos endereços das pessoas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE enderecos (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    pessoa_id UUID NOT NULL,

    tipo VARCHAR(20) NOT NULL,

    cep VARCHAR(8) NOT NULL,

    logradouro VARCHAR(200) NOT NULL,

    numero VARCHAR(20) NOT NULL,

    complemento VARCHAR(100),

    bairro VARCHAR(100) NOT NULL,

    cidade VARCHAR(100) NOT NULL,

    uf VARCHAR(2) NOT NULL,

    pais VARCHAR(100) NOT NULL DEFAULT 'Brasil',

    principal BOOLEAN NOT NULL DEFAULT FALSE,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_enderecos_pessoa
        FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT ck_enderecos_tipo
        CHECK (
            tipo IN (
                'RESIDENCIAL',
                'COBRANCA',
                'ENTREGA',
                'FISCAL',
                'COMERCIAL',
                'OUTRO'
            )
        )

);

CREATE UNIQUE INDEX uq_enderecos_pessoa_principal
    ON enderecos (pessoa_id)
    WHERE principal = TRUE
      AND ativo = TRUE;

CREATE INDEX idx_enderecos_pessoa_id
    ON enderecos (pessoa_id);

COMMIT;
