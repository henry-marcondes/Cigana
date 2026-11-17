BEGIN;

ALTER TABLE cena_textos
DROP CONSTRAINT IF EXISTS fk_cena_textos_documento_obra;

COMMIT;
