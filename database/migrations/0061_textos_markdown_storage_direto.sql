BEGIN;

-- Arquivos narrativos podem ser associados diretamente ao arquivo de mídia.
ALTER TABLE cena_textos
    DROP CONSTRAINT fk_cena_textos_arquivo_mesma_obra;

ALTER TABLE cena_textos
    ADD CONSTRAINT fk_cena_textos_arquivo_mesma_obra
    FOREIGN KEY (arquivo_id, livro_id)
    REFERENCES arquivos_midia(id, livro_id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE OR REPLACE FUNCTION validar_cena_texto_documento() RETURNS TRIGGER AS $$
DECLARE livro_cena UUID; arquivo_ativo BOOLEAN; mime_arquivo TEXT; nome_arquivo TEXT;
BEGIN
    IF NEW.arquivo_id IS NULL THEN RETURN NEW; END IF;
    IF NEW.cena_id IS NULL THEN
        RAISE EXCEPTION 'Texto Markdown gerenciado exige cena_id.' USING ERRCODE = '23514';
    END IF;
    SELECT cap.livro_id INTO livro_cena
      FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id
     WHERE c.id = NEW.cena_id AND c.ativo = TRUE AND cap.ativo = TRUE;
    SELECT ativo, mime_type, nome_original INTO arquivo_ativo, mime_arquivo, nome_arquivo
      FROM arquivos_midia WHERE id = NEW.arquivo_id AND livro_id = NEW.livro_id;
    IF livro_cena IS DISTINCT FROM NEW.livro_id OR arquivo_ativo IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Texto, cena e arquivo devem pertencer à mesma obra e estar ativos.' USING ERRCODE = '23514';
    END IF;
    IF lower(nome_arquivo) !~ '\.(md|markdown)$'
       OR mime_arquivo NOT IN ('text/markdown', 'text/plain', 'text/x-markdown') THEN
        RAISE EXCEPTION 'O arquivo associado deve ser Markdown.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION impedir_desativacao_arquivo_texto_narrativo() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.ativo = TRUE AND NEW.ativo = FALSE AND EXISTS (
        SELECT 1 FROM cena_textos WHERE arquivo_id = OLD.id
    ) THEN
        RAISE EXCEPTION 'Arquivo vinculado a texto narrativo não pode ser desativado.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_arquivo_texto_narrativo_ativo
    BEFORE UPDATE OF ativo ON arquivos_midia
    FOR EACH ROW EXECUTE FUNCTION impedir_desativacao_arquivo_texto_narrativo();

CREATE OR REPLACE FUNCTION impedir_reutilizacao_arquivo_midia() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.arquivo_id IS NULL THEN RETURN NEW; END IF;
    IF TG_OP = 'UPDATE' AND OLD.arquivo_id IS NOT DISTINCT FROM NEW.arquivo_id THEN
        RETURN NEW;
    END IF;
    PERFORM 1 FROM arquivos_midia WHERE id = NEW.arquivo_id FOR UPDATE;
    IF EXISTS (SELECT 1 FROM cena_textos WHERE arquivo_id = NEW.arquivo_id
               AND (TG_TABLE_NAME <> 'cena_textos' OR id IS DISTINCT FROM NEW.id))
       OR EXISTS (SELECT 1 FROM cena_imagens WHERE arquivo_id = NEW.arquivo_id
                  AND (TG_TABLE_NAME <> 'cena_imagens' OR id IS DISTINCT FROM NEW.id))
       OR EXISTS (SELECT 1 FROM cena_audios WHERE arquivo_id = NEW.arquivo_id
                  AND (TG_TABLE_NAME <> 'cena_audios' OR id IS DISTINCT FROM NEW.id))
       OR EXISTS (SELECT 1 FROM cena_videos WHERE arquivo_id = NEW.arquivo_id
                  AND (TG_TABLE_NAME <> 'cena_videos' OR id IS DISTINCT FROM NEW.id))
       OR EXISTS (SELECT 1 FROM livro_documentos WHERE arquivo_id = NEW.arquivo_id
                  AND (TG_TABLE_NAME <> 'livro_documentos' OR id IS DISTINCT FROM NEW.id)) THEN
        RAISE EXCEPTION 'Arquivo gerenciado já foi utilizado e não pode ser associado novamente.' USING ERRCODE = '23505';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_arquivo_uso_unico_cena_textos
    BEFORE INSERT OR UPDATE OF arquivo_id ON cena_textos
    FOR EACH ROW EXECUTE FUNCTION impedir_reutilizacao_arquivo_midia();
CREATE TRIGGER trg_arquivo_uso_unico_cena_imagens
    BEFORE INSERT OR UPDATE OF arquivo_id ON cena_imagens
    FOR EACH ROW EXECUTE FUNCTION impedir_reutilizacao_arquivo_midia();
CREATE TRIGGER trg_arquivo_uso_unico_cena_audios
    BEFORE INSERT OR UPDATE OF arquivo_id ON cena_audios
    FOR EACH ROW EXECUTE FUNCTION impedir_reutilizacao_arquivo_midia();
CREATE TRIGGER trg_arquivo_uso_unico_cena_videos
    BEFORE INSERT OR UPDATE OF arquivo_id ON cena_videos
    FOR EACH ROW EXECUTE FUNCTION impedir_reutilizacao_arquivo_midia();
CREATE TRIGGER trg_arquivo_uso_unico_livro_documentos
    BEFORE INSERT OR UPDATE OF arquivo_id ON livro_documentos
    FOR EACH ROW EXECUTE FUNCTION impedir_reutilizacao_arquivo_midia();

CREATE OR REPLACE FUNCTION impedir_reassociacao_texto_storage() RETURNS TRIGGER AS $$
DECLARE arquivo_narrativo UUID;
BEGIN
    IF NEW.tipo_conteudo <> 'TEXTO' OR NEW.ativo IS DISTINCT FROM TRUE THEN RETURN NEW; END IF;
    SELECT arquivo_id INTO arquivo_narrativo
      FROM cena_textos WHERE id = NEW.conteudo_id FOR UPDATE;
    IF arquivo_narrativo IS NOT NULL AND EXISTS (
        SELECT 1 FROM cena_conteudos
         WHERE tipo_conteudo = 'TEXTO' AND conteudo_id = NEW.conteudo_id
           AND id IS DISTINCT FROM NEW.id
    ) THEN
        RAISE EXCEPTION 'Texto Markdown gerenciado já foi associado e não pode ser reutilizado.' USING ERRCODE = '23505';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cena_texto_storage_uso_unico
    BEFORE INSERT OR UPDATE OF tipo_conteudo, conteudo_id, ativo ON cena_conteudos
    FOR EACH ROW EXECUTE FUNCTION impedir_reassociacao_texto_storage();

COMMIT;
