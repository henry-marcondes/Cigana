BEGIN;

CREATE FUNCTION validar_arquivo_documento_markdown() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM livro_documentos WHERE arquivo_id = OLD.id AND ativo = TRUE)
       AND ((lower(NEW.nome_original) NOT LIKE '%.md' AND lower(NEW.nome_original) NOT LIKE '%.markdown')
            OR NEW.mime_type NOT IN ('text/markdown', 'text/plain', 'text/x-markdown')) THEN
        RAISE EXCEPTION 'O tipo e a extensão do documento Markdown gerenciado devem ser preservados.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_arquivo_documento_markdown_tipo
    BEFORE UPDATE OF nome_original, mime_type ON arquivos_midia
    FOR EACH ROW EXECUTE FUNCTION validar_arquivo_documento_markdown();

COMMIT;
