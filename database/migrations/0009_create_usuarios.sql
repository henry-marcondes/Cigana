-- =====================================================
-- Migration: 0009_create_usuarios.sql
-- Descrição : Criação da tabela de usuários
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email TEXT NOT NULL,
    senha_hash TEXT NOT NULL,

    email_verificado_em TIMESTAMPTZ,
    ultimo_login_em TIMESTAMPTZ,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_usuarios_email
        UNIQUE (email)
);
