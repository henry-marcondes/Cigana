-- =====================================================
-- Migration: 0045_add_evidencias_contratos_aceites.sql
-- Descrição : Registra obra e hash do conteúdo aceito
-- Projeto   : Plataforma Cigana
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

ALTER TABLE contratos_aceites
    ADD COLUMN livro_id UUID,
    ADD COLUMN hash_conteudo CHAR(64);

ALTER TABLE contratos_aceites
    ADD CONSTRAINT fk_contratos_aceites_livro FOREIGN KEY (livro_id)
        REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE INDEX idx_contratos_aceites_livro
    ON contratos_aceites (livro_id);

CREATE INDEX idx_contratos_aceites_hash_conteudo
    ON contratos_aceites (hash_conteudo);

-- Aceites históricos não recebem obra nem hash inventados. Quando não há
-- registros, os campos podem ser obrigatórios desde a aplicação da migration.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM contratos_aceites LIMIT 1) THEN
        ALTER TABLE contratos_aceites
            ALTER COLUMN livro_id SET NOT NULL,
            ALTER COLUMN hash_conteudo SET NOT NULL;
    END IF;
END;
$$;

COMMIT;
