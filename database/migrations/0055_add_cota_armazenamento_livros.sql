-- Cota individual de armazenamento para cada obra.
-- 521 MiB = 521 * 1024 * 1024 bytes.

BEGIN;

ALTER TABLE livros
    ADD COLUMN cota_armazenamento_bytes BIGINT NOT NULL DEFAULT 546308096,
    ADD CONSTRAINT ck_livros_cota_armazenamento_nao_negativa
        CHECK (cota_armazenamento_bytes >= 0);

COMMIT;
