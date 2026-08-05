-- =====================================================
-- Migration: 0010_create_perfis_usuario.sql
-- Descrição : Criação da tabela de perfis de usuário
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================

CREATE TABLE perfis_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,

    nome TEXT NOT NULL,
    sobrenome TEXT NOT NULL,
    nome_usuario TEXT NOT NULL,

    avatar_url TEXT,
    biografia TEXT,

    idioma_id UUID,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_perfis_usuario_usuario_id
        UNIQUE (usuario_id),

    CONSTRAINT uq_perfis_usuario_nome_usuario
        UNIQUE (nome_usuario),

    CONSTRAINT fk_perfis_usuario_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_perfis_usuario_idioma
        FOREIGN KEY (idioma_id)
        REFERENCES idiomas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
