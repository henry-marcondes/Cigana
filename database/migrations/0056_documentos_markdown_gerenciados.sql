BEGIN;

CREATE TABLE livro_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    livro_id UUID NOT NULL,
    arquivo_id UUID NOT NULL,
    papel TEXT NOT NULL DEFAULT 'SECUNDARIO',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_livro_documentos_papel CHECK (papel IN ('PRINCIPAL', 'SECUNDARIO')),
    CONSTRAINT uq_livro_documentos_livro_arquivo UNIQUE (livro_id, arquivo_id),
    CONSTRAINT uq_livro_documentos_arquivo_livro UNIQUE (arquivo_id, livro_id),
    CONSTRAINT uq_livro_documentos_id_livro UNIQUE (id, livro_id),
    CONSTRAINT fk_livro_documentos_livro FOREIGN KEY (livro_id)
        REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_livro_documentos_arquivo_mesma_obra FOREIGN KEY (arquivo_id, livro_id)
        REFERENCES arquivos_midia(id, livro_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_livro_documentos_principal_ativo
    ON livro_documentos(livro_id) WHERE ativo = TRUE AND papel = 'PRINCIPAL';
CREATE INDEX idx_livro_documentos_arquivo ON livro_documentos(arquivo_id);

CREATE FUNCTION validar_livro_documento_markdown() RETURNS TRIGGER AS $$
DECLARE ativo_arquivo BOOLEAN; mime_arquivo TEXT; nome_arquivo TEXT;
BEGIN
    SELECT ativo, mime_type, nome_original INTO ativo_arquivo, mime_arquivo, nome_arquivo
      FROM arquivos_midia WHERE id = NEW.arquivo_id AND livro_id = NEW.livro_id;
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

CREATE TRIGGER trg_livro_documento_markdown
    BEFORE INSERT OR UPDATE OF livro_id, arquivo_id, ativo ON livro_documentos
    FOR EACH ROW EXECUTE FUNCTION validar_livro_documento_markdown();

CREATE FUNCTION impedir_desativacao_documento_com_textos() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.ativo = TRUE AND NEW.ativo = FALSE AND EXISTS (
        SELECT 1 FROM cena_textos WHERE livro_id = OLD.livro_id
          AND arquivo_id = OLD.arquivo_id AND ativo = TRUE
    ) THEN
        RAISE EXCEPTION 'Documento possui textos de cena ativos.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_livro_documento_com_textos_ativo
    BEFORE UPDATE OF ativo ON livro_documentos
    FOR EACH ROW EXECUTE FUNCTION impedir_desativacao_documento_com_textos();

CREATE FUNCTION impedir_desativacao_arquivo_documental_vinculado() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.ativo = TRUE AND NEW.ativo = FALSE AND EXISTS (
        SELECT 1 FROM livro_documentos WHERE arquivo_id = OLD.id AND ativo = TRUE
    ) THEN
        RAISE EXCEPTION 'Desative o vínculo documental antes de desativar o arquivo.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_arquivo_documental_vinculado_ativo
    BEFORE UPDATE OF ativo ON arquivos_midia
    FOR EACH ROW EXECUTE FUNCTION impedir_desativacao_arquivo_documental_vinculado();

ALTER TABLE cena_textos ALTER COLUMN texto_url DROP NOT NULL;
ALTER TABLE cena_textos ADD COLUMN arquivo_id UUID;
ALTER TABLE cena_textos ADD COLUMN livro_id UUID;
ALTER TABLE cena_textos ADD CONSTRAINT fk_cena_textos_arquivo_mesma_obra
    FOREIGN KEY (arquivo_id, livro_id) REFERENCES arquivos_midia(id, livro_id)
    ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE cena_textos ADD CONSTRAINT fk_cena_textos_documento_obra
    FOREIGN KEY (arquivo_id, livro_id) REFERENCES livro_documentos(arquivo_id, livro_id)
    ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE cena_textos ADD CONSTRAINT fk_cena_textos_livro
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT;
CREATE INDEX idx_cena_textos_arquivo ON cena_textos(arquivo_id);

CREATE FUNCTION validar_cena_texto_documento() RETURNS TRIGGER AS $$
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
     WHERE ld.livro_id = NEW.livro_id AND ld.arquivo_id = NEW.arquivo_id;
    IF livro_cena IS DISTINCT FROM NEW.livro_id OR doc_ativo IS DISTINCT FROM TRUE OR arquivo_ativo IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Texto, cena e documento devem pertencer à mesma obra e estar ativos.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cena_texto_documento
    BEFORE INSERT OR UPDATE OF cena_id, arquivo_id, livro_id ON cena_textos
    FOR EACH ROW EXECUTE FUNCTION validar_cena_texto_documento();

COMMIT;
