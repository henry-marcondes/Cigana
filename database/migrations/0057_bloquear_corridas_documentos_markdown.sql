BEGIN;

CREATE OR REPLACE FUNCTION validar_livro_documento_markdown() RETURNS TRIGGER AS $$
DECLARE ativo_arquivo BOOLEAN; mime_arquivo TEXT; nome_arquivo TEXT;
BEGIN
    SELECT ativo, mime_type, nome_original INTO ativo_arquivo, mime_arquivo, nome_arquivo
      FROM arquivos_midia WHERE id = NEW.arquivo_id AND livro_id = NEW.livro_id FOR SHARE;
    IF ativo_arquivo IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Documento deve referenciar arquivo gerenciado ativo da mesma obra.' USING ERRCODE = '23514';
    END IF;
    IF lower(nome_arquivo) NOT LIKE '%.md' AND lower(nome_arquivo) NOT LIKE '%.markdown' THEN
        RAISE EXCEPTION 'Arquivo deve possuir extensão Markdown.' USING ERRCODE = '23514';
    END IF;
    IF mime_arquivo NOT IN ('text/markdown', 'text/plain', 'text/x-markdown') THEN
        RAISE EXCEPTION 'Arquivo não identificado como Markdown.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validar_cena_texto_documento() RETURNS TRIGGER AS $$
DECLARE livro_cena UUID; doc_ativo BOOLEAN; arquivo_ativo BOOLEAN;
BEGIN
    IF NEW.arquivo_id IS NULL THEN
        IF NEW.livro_id IS NOT NULL THEN
            RAISE EXCEPTION 'livro_id requer arquivo_id.' USING ERRCODE = '23514';
        END IF;
        RETURN NEW;
    END IF;
    SELECT cap.livro_id INTO livro_cena
      FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id
     WHERE c.id = NEW.cena_id;
    SELECT ld.ativo, a.ativo INTO doc_ativo, arquivo_ativo
      FROM livro_documentos ld JOIN arquivos_midia a ON a.id = ld.arquivo_id
     WHERE ld.livro_id = NEW.livro_id AND ld.arquivo_id = NEW.arquivo_id
     FOR SHARE OF ld, a;
    IF livro_cena IS DISTINCT FROM NEW.livro_id OR doc_ativo IS DISTINCT FROM TRUE OR arquivo_ativo IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Texto, cena e documento devem pertencer à mesma obra e estar ativos.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
