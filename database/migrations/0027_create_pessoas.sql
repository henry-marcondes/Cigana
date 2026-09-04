-- =====================================================
-- Migration: 0027_create_pessoas.sql
-- Descrição : Criação do cadastro geral de pessoas
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================
BEGIN;

CREATE TABLE pessoas (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,

    tipo_pessoa VARCHAR(10),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_pessoas_usuario_id
        UNIQUE (usuario_id),

    CONSTRAINT fk_pessoas_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_pessoas_tipo_pessoa
        CHECK (
            tipo_pessoa IS NULL
            OR tipo_pessoa IN ('FISICA', 'JURIDICA')
        )

);

COMMIT;
