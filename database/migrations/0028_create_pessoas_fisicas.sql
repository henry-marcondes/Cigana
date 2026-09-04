-- =====================================================
-- Migration: 0028_create_pessoas_fisicas.sql
-- Descrição : Criação dos dados de pessoa física
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================
BEGIN;

CREATE TABLE pessoas_fisicas (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    pessoa_id UUID NOT NULL,

    nome VARCHAR(100) NOT NULL,

    sobrenome VARCHAR(100) NOT NULL,

    data_nascimento DATE,

    cpf VARCHAR(11),

    rg VARCHAR(30),

    orgao_expedidor_rg VARCHAR(100),

    uf_expedidor_rg VARCHAR(2),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_pessoas_fisicas_pessoa_id
        UNIQUE (pessoa_id),

    CONSTRAINT uq_pessoas_fisicas_cpf
        UNIQUE (cpf),

    CONSTRAINT fk_pessoas_fisicas_pessoa
        FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

COMMIT;
