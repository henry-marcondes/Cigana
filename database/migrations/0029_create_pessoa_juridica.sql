-- =====================================================
-- Migration: 0029_create_pessoas_juridicas.sql
-- Descrição : Criação dos dados de pessoa jurídica
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE pessoas_juridicas (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    pessoa_id UUID NOT NULL,

    razao_social VARCHAR(150) NOT NULL,

    nome_fantasia VARCHAR(150),

    cnpj VARCHAR(14),

    inscricao_estadual VARCHAR(30),

    inscricao_municipal VARCHAR(30),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_pessoas_juridicas_pessoa_id
        UNIQUE (pessoa_id),

    CONSTRAINT uq_pessoas_juridicas_cnpj
        UNIQUE (cnpj),

    CONSTRAINT fk_pessoas_juridicas_pessoa
        FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

COMMIT;
