-- ============================================================
-- Migration: 0024_create_tokens_usuario.sql
-- Entidade: tokens_usuario
-- Finalidade:
--   VERIFICACAO_EMAIL
--   ALTERACAO_SENHA
--   RECUPERACAO_SENHA
-- ============================================================

CREATE TABLE tokens_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,

    finalidade VARCHAR(30) NOT NULL,

    token_hash VARCHAR(255) NOT NULL,

    expira_em TIMESTAMPTZ NOT NULL,

    usado_em TIMESTAMPTZ NULL,

    tentativas INTEGER NOT NULL DEFAULT 0,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tokens_usuario_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_tokens_usuario_finalidade
        CHECK (
            finalidade IN (
                'VERIFICACAO_EMAIL',
                'ALTERACAO_SENHA',
                'RECUPERACAO_SENHA'
            )
        ),

    CONSTRAINT chk_tokens_usuario_tentativas
        CHECK (tentativas >= 0)
);

-- Índice para localizar rapidamente os tokens de um usuário
CREATE INDEX idx_tokens_usuario_usuario_id
    ON tokens_usuario(usuario_id);

-- Índice para consultas por usuário e finalidade
CREATE INDEX idx_tokens_usuario_finalidade
    ON tokens_usuario(usuario_id, finalidade);

-- Índice para controle de expiração
CREATE INDEX idx_tokens_usuario_expira_em
    ON tokens_usuario(expira_em);

-- Garante apenas um token ativo e não utilizado
-- por usuário e finalidade.
CREATE UNIQUE INDEX uq_tokens_usuario_ativo
    ON tokens_usuario(usuario_id, finalidade)
    WHERE ativo = TRUE
      AND usado_em IS NULL;
