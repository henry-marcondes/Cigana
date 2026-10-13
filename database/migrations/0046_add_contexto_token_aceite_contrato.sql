-- =====================================================
-- Migration: 0046_add_contexto_token_aceite_contrato.sql
-- Descrição : Adiciona contexto ao token de confirmação de aceite
-- =====================================================

BEGIN;

ALTER TABLE tokens_usuario
    ADD COLUMN dados_adicionais JSONB;

ALTER TABLE tokens_usuario
    DROP CONSTRAINT chk_tokens_usuario_finalidade;

ALTER TABLE tokens_usuario
    ADD CONSTRAINT chk_tokens_usuario_finalidade
    CHECK (
        finalidade IN (
            'VERIFICACAO_EMAIL',
            'ALTERACAO_SENHA',
            'RECUPERACAO_SENHA',
            'ACEITE_CONTRATO'
        )
    );

COMMIT;
