BEGIN;

ALTER TABLE cena_textos
    ADD COLUMN conteudo TEXT;

COMMENT ON COLUMN cena_textos.conteudo IS
    'Corpo de textos independentes da obra; não representa texto_url nem trechos Markdown gerenciados.';

COMMIT;
