-- Associa arquivos gerenciados aos conteúdos de imagem, áudio e vídeo.
-- URLs existentes são preservadas para compatibilidade com conteúdos legados.

BEGIN;

ALTER TABLE cena_imagens
    ALTER COLUMN imagem_url DROP NOT NULL,
    ADD COLUMN arquivo_id UUID,
    ADD CONSTRAINT fk_cena_imagens_arquivo
        FOREIGN KEY (arquivo_id) REFERENCES arquivos_midia(id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE cena_audios
    ALTER COLUMN audio_url DROP NOT NULL,
    ADD COLUMN arquivo_id UUID,
    ADD CONSTRAINT fk_cena_audios_arquivo
        FOREIGN KEY (arquivo_id) REFERENCES arquivos_midia(id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE cena_videos
    ALTER COLUMN video_url DROP NOT NULL,
    ADD COLUMN arquivo_id UUID,
    ADD CONSTRAINT fk_cena_videos_arquivo
        FOREIGN KEY (arquivo_id) REFERENCES arquivos_midia(id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE INDEX idx_cena_imagens_arquivo ON cena_imagens (arquivo_id);
CREATE INDEX idx_cena_audios_arquivo ON cena_audios (arquivo_id);
CREATE INDEX idx_cena_videos_arquivo ON cena_videos (arquivo_id);

CREATE FUNCTION validar_arquivo_midia_mesma_obra()
RETURNS TRIGGER AS $$
DECLARE
    obra_cena UUID;
    obra_arquivo UUID;
    arquivo_ativo BOOLEAN;
BEGIN
    IF NEW.arquivo_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT cap.livro_id
      INTO obra_cena
      FROM cenas c
      JOIN capitulos cap ON cap.id = c.capitulo_id
     WHERE c.id = NEW.cena_id;

    SELECT livro_id, ativo
      INTO obra_arquivo, arquivo_ativo
      FROM arquivos_midia
     WHERE id = NEW.arquivo_id;

    IF obra_cena IS NULL OR obra_arquivo IS NULL OR obra_cena <> obra_arquivo THEN
        RAISE EXCEPTION 'O arquivo gerenciado e o conteúdo devem pertencer à mesma obra.'
            USING ERRCODE = '23514';
    END IF;

    IF TG_OP = 'INSERT' AND NOT arquivo_ativo THEN
        RAISE EXCEPTION 'Arquivos gerenciados inativos não podem receber novas associações.'
            USING ERRCODE = '23514';
    ELSIF TG_OP = 'UPDATE'
       AND NEW.arquivo_id IS DISTINCT FROM OLD.arquivo_id
       AND NOT arquivo_ativo THEN
        RAISE EXCEPTION 'Arquivos gerenciados inativos não podem receber novas associações.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cena_imagens_arquivo_mesma_obra
    BEFORE INSERT OR UPDATE OF cena_id, arquivo_id ON cena_imagens
    FOR EACH ROW EXECUTE FUNCTION validar_arquivo_midia_mesma_obra();

CREATE TRIGGER trg_cena_audios_arquivo_mesma_obra
    BEFORE INSERT OR UPDATE OF cena_id, arquivo_id ON cena_audios
    FOR EACH ROW EXECUTE FUNCTION validar_arquivo_midia_mesma_obra();

CREATE TRIGGER trg_cena_videos_arquivo_mesma_obra
    BEFORE INSERT OR UPDATE OF cena_id, arquivo_id ON cena_videos
    FOR EACH ROW EXECUTE FUNCTION validar_arquivo_midia_mesma_obra();

COMMIT;
