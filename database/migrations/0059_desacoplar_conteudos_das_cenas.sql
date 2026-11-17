BEGIN;

-- Interrompe com diagnóstico caso cenas/obras ou vínculos Markdown estejam inconsistentes.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM cena_imagens ci
        LEFT JOIN cenas c ON c.id = ci.cena_id
        LEFT JOIN capitulos cap ON cap.id = c.capitulo_id
        WHERE c.id IS NULL OR cap.livro_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Backfill impedido: há imagens sem cena/capítulo/obra válido.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM cena_audios ca
        LEFT JOIN cenas c ON c.id = ca.cena_id
        LEFT JOIN capitulos cap ON cap.id = c.capitulo_id
        WHERE c.id IS NULL OR cap.livro_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Backfill impedido: há áudios sem cena/capítulo/obra válido.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM cena_videos cv
        LEFT JOIN cenas c ON c.id = cv.cena_id
        LEFT JOIN capitulos cap ON cap.id = c.capitulo_id
        WHERE c.id IS NULL OR cap.livro_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Backfill impedido: há vídeos sem cena/capítulo/obra válido.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM cena_textos ct
        LEFT JOIN cenas c ON c.id = ct.cena_id
        LEFT JOIN capitulos cap ON cap.id = c.capitulo_id
        WHERE c.id IS NULL OR cap.livro_id IS NULL
           OR (ct.livro_id IS NOT NULL AND ct.livro_id <> cap.livro_id)
    ) THEN
        RAISE EXCEPTION 'Backfill impedido: há textos cuja obra diverge da obra da cena.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM cena_conteudos cc
        LEFT JOIN cenas c ON c.id = cc.cena_id
        LEFT JOIN capitulos cap ON cap.id = c.capitulo_id
        WHERE c.id IS NULL OR cap.livro_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Backfill impedido: há associações sem cena/capítulo/obra válido.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM cena_conteudos
         WHERE ativo = TRUE
         GROUP BY tipo_conteudo, conteudo_id HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Migration impedida: conteúdo já possui associações ativas duplicadas.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM cena_conteudos cc
        LEFT JOIN cena_textos ct ON cc.tipo_conteudo = 'TEXTO' AND ct.id = cc.conteudo_id
        LEFT JOIN cena_imagens ci ON cc.tipo_conteudo = 'IMAGEM' AND ci.id = cc.conteudo_id
        LEFT JOIN cena_audios ca ON cc.tipo_conteudo = 'AUDIO' AND ca.id = cc.conteudo_id
        LEFT JOIN cena_videos cv ON cc.tipo_conteudo = 'VIDEO' AND cv.id = cc.conteudo_id
        WHERE cc.ativo = TRUE AND (
            (cc.tipo_conteudo = 'TEXTO' AND (ct.id IS NULL OR NOT ct.ativo)) OR
            (cc.tipo_conteudo = 'IMAGEM' AND (ci.id IS NULL OR NOT ci.ativo)) OR
            (cc.tipo_conteudo = 'AUDIO' AND (ca.id IS NULL OR NOT ca.ativo)) OR
            (cc.tipo_conteudo = 'VIDEO' AND (cv.id IS NULL OR NOT cv.ativo))
        )
    ) THEN
        RAISE EXCEPTION 'Migration impedida: há associações ativas com conteúdo tipado ausente ou inativo.';
    END IF;
    IF EXISTS (
        SELECT 1
          FROM cena_conteudos cc
          JOIN cenas destino ON destino.id = cc.cena_id
          JOIN capitulos cap_destino ON cap_destino.id = destino.capitulo_id
          LEFT JOIN cena_textos ct ON cc.tipo_conteudo = 'TEXTO' AND ct.id = cc.conteudo_id
          LEFT JOIN cenas cena_texto ON cena_texto.id = ct.cena_id
          LEFT JOIN capitulos cap_texto ON cap_texto.id = cena_texto.capitulo_id
          LEFT JOIN cena_imagens ci ON cc.tipo_conteudo = 'IMAGEM' AND ci.id = cc.conteudo_id
          LEFT JOIN cenas cena_imagem ON cena_imagem.id = ci.cena_id
          LEFT JOIN capitulos cap_imagem ON cap_imagem.id = cena_imagem.capitulo_id
          LEFT JOIN cena_audios ca ON cc.tipo_conteudo = 'AUDIO' AND ca.id = cc.conteudo_id
          LEFT JOIN cenas cena_audio ON cena_audio.id = ca.cena_id
          LEFT JOIN capitulos cap_audio ON cap_audio.id = cena_audio.capitulo_id
          LEFT JOIN cena_videos cv ON cc.tipo_conteudo = 'VIDEO' AND cv.id = cc.conteudo_id
          LEFT JOIN cenas cena_video ON cena_video.id = cv.cena_id
          LEFT JOIN capitulos cap_video ON cap_video.id = cena_video.capitulo_id
         WHERE cc.ativo = TRUE AND (
            (cc.tipo_conteudo = 'TEXTO' AND COALESCE(ct.livro_id, cap_texto.livro_id) IS DISTINCT FROM cap_destino.livro_id) OR
            (cc.tipo_conteudo = 'IMAGEM' AND cap_imagem.livro_id IS DISTINCT FROM cap_destino.livro_id) OR
            (cc.tipo_conteudo = 'AUDIO' AND cap_audio.livro_id IS DISTINCT FROM cap_destino.livro_id) OR
            (cc.tipo_conteudo = 'VIDEO' AND cap_video.livro_id IS DISTINCT FROM cap_destino.livro_id)
         )
    ) THEN
        RAISE EXCEPTION 'Migration impedida: há associações entre conteúdo e cena de obras diferentes.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM cena_imagens ci
        JOIN cenas c ON c.id = ci.cena_id
        JOIN capitulos cap ON cap.id = c.capitulo_id
        LEFT JOIN arquivos_midia a ON a.id = ci.arquivo_id
        WHERE ci.arquivo_id IS NOT NULL AND (a.id IS NULL OR a.livro_id <> cap.livro_id)
    ) OR EXISTS (
        SELECT 1 FROM cena_audios ca
        JOIN cenas c ON c.id = ca.cena_id
        JOIN capitulos cap ON cap.id = c.capitulo_id
        LEFT JOIN arquivos_midia a ON a.id = ca.arquivo_id
        WHERE ca.arquivo_id IS NOT NULL AND (a.id IS NULL OR a.livro_id <> cap.livro_id)
    ) OR EXISTS (
        SELECT 1 FROM cena_videos cv
        JOIN cenas c ON c.id = cv.cena_id
        JOIN capitulos cap ON cap.id = c.capitulo_id
        LEFT JOIN arquivos_midia a ON a.id = cv.arquivo_id
        WHERE cv.arquivo_id IS NOT NULL AND (a.id IS NULL OR a.livro_id <> cap.livro_id)
    ) THEN
        RAISE EXCEPTION 'Migration impedida: há arquivos de mídia associados a conteúdo de outra obra.';
    END IF;
END;
$$;

ALTER TABLE cena_textos ADD COLUMN titulo TEXT;
ALTER TABLE cena_textos ADD COLUMN IF NOT EXISTS livro_id UUID;
ALTER TABLE cena_imagens ADD COLUMN livro_id UUID;
ALTER TABLE cena_audios ADD COLUMN livro_id UUID;
ALTER TABLE cena_videos ADD COLUMN livro_id UUID;

-- Instala primeiro a regra compatível para o backfill de textos independentes.
CREATE OR REPLACE FUNCTION validar_cena_texto_documento() RETURNS TRIGGER AS $$
DECLARE livro_cena UUID; doc_ativo BOOLEAN; arquivo_ativo BOOLEAN;
BEGIN
    IF NEW.arquivo_id IS NULL THEN RETURN NEW; END IF;
    IF NEW.cena_id IS NULL THEN
        RAISE EXCEPTION 'Trechos de documentos Markdown gerenciados exigem cena_id.' USING ERRCODE = '23514';
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

UPDATE cena_textos ct SET livro_id = cap.livro_id
  FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id
 WHERE ct.cena_id = c.id AND ct.livro_id IS NULL;
UPDATE cena_imagens ci SET livro_id = cap.livro_id
  FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id WHERE ci.cena_id = c.id;
UPDATE cena_audios ca SET livro_id = cap.livro_id
  FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id WHERE ca.cena_id = c.id;
UPDATE cena_videos cv SET livro_id = cap.livro_id
  FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id WHERE cv.cena_id = c.id;

-- Guarda a obra da associação para validar conteúdo/cena sem depender de cena_id tipado.
ALTER TABLE cena_conteudos ADD COLUMN livro_id UUID;
UPDATE cena_conteudos cc SET livro_id = cap.livro_id
  FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id WHERE cc.cena_id = c.id;

ALTER TABLE cena_textos ALTER COLUMN livro_id SET NOT NULL;
ALTER TABLE cena_imagens ALTER COLUMN livro_id SET NOT NULL;
ALTER TABLE cena_audios ALTER COLUMN livro_id SET NOT NULL;
ALTER TABLE cena_videos ALTER COLUMN livro_id SET NOT NULL;
ALTER TABLE cena_conteudos ALTER COLUMN livro_id SET NOT NULL;

ALTER TABLE cena_textos ALTER COLUMN cena_id DROP NOT NULL;
ALTER TABLE cena_imagens ALTER COLUMN cena_id DROP NOT NULL;
ALTER TABLE cena_audios ALTER COLUMN cena_id DROP NOT NULL;
ALTER TABLE cena_videos ALTER COLUMN cena_id DROP NOT NULL;

ALTER TABLE cena_imagens ADD CONSTRAINT fk_cena_imagens_livro
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE cena_audios ADD CONSTRAINT fk_cena_audios_livro
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE cena_videos ADD CONSTRAINT fk_cena_videos_livro
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE cena_conteudos ADD CONSTRAINT fk_cena_conteudos_livro
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE UNIQUE INDEX uq_cena_textos_id_livro ON cena_textos (id, livro_id);
CREATE UNIQUE INDEX uq_cena_imagens_id_livro ON cena_imagens (id, livro_id);
CREATE UNIQUE INDEX uq_cena_audios_id_livro ON cena_audios (id, livro_id);
CREATE UNIQUE INDEX uq_cena_videos_id_livro ON cena_videos (id, livro_id);

-- A unicidade parcial considera tipo, pois UUIDs podem se repetir entre tabelas tipadas.
CREATE UNIQUE INDEX uq_cena_conteudos_texto_ativo
    ON cena_conteudos (conteudo_id) WHERE ativo = TRUE AND tipo_conteudo = 'TEXTO';
CREATE UNIQUE INDEX uq_cena_conteudos_imagem_ativo
    ON cena_conteudos (conteudo_id) WHERE ativo = TRUE AND tipo_conteudo = 'IMAGEM';
CREATE UNIQUE INDEX uq_cena_conteudos_audio_ativo
    ON cena_conteudos (conteudo_id) WHERE ativo = TRUE AND tipo_conteudo = 'AUDIO';
CREATE UNIQUE INDEX uq_cena_conteudos_video_ativo
    ON cena_conteudos (conteudo_id) WHERE ativo = TRUE AND tipo_conteudo = 'VIDEO';

CREATE FUNCTION validar_cena_conteudo_mesma_obra() RETURNS TRIGGER AS $$
DECLARE livro_cena UUID; livro_conteudo UUID; conteudo_ativo BOOLEAN;
BEGIN
    IF NEW.ativo IS DISTINCT FROM TRUE THEN RETURN NEW; END IF;
    SELECT cap.livro_id INTO livro_cena
      FROM cenas c JOIN capitulos cap ON cap.id = c.capitulo_id
     WHERE c.id = NEW.cena_id AND c.ativo = TRUE AND cap.ativo = TRUE
     FOR KEY SHARE OF c, cap;
    IF livro_cena IS NULL OR livro_cena <> NEW.livro_id THEN
        RAISE EXCEPTION 'Cena e associação devem pertencer à mesma obra.' USING ERRCODE = '23514';
    END IF;

    CASE NEW.tipo_conteudo
        WHEN 'TEXTO' THEN
            SELECT livro_id, ativo INTO livro_conteudo, conteudo_ativo FROM cena_textos WHERE id = NEW.conteudo_id FOR KEY SHARE;
        WHEN 'IMAGEM' THEN
            SELECT livro_id, ativo INTO livro_conteudo, conteudo_ativo FROM cena_imagens WHERE id = NEW.conteudo_id FOR KEY SHARE;
        WHEN 'AUDIO' THEN
            SELECT livro_id, ativo INTO livro_conteudo, conteudo_ativo FROM cena_audios WHERE id = NEW.conteudo_id FOR KEY SHARE;
        WHEN 'VIDEO' THEN
            SELECT livro_id, ativo INTO livro_conteudo, conteudo_ativo FROM cena_videos WHERE id = NEW.conteudo_id FOR KEY SHARE;
        ELSE
            RAISE EXCEPTION 'Tipo de conteúdo inválido.' USING ERRCODE = '23514';
    END CASE;

    IF livro_conteudo IS NULL OR livro_conteudo <> NEW.livro_id OR conteudo_ativo IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Conteúdo ativo e cena devem pertencer à obra da associação.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cena_conteudo_mesma_obra
    BEFORE INSERT OR UPDATE OF cena_id, livro_id, tipo_conteudo, conteudo_id, ativo
    ON cena_conteudos FOR EACH ROW EXECUTE FUNCTION validar_cena_conteudo_mesma_obra();

-- Conteúdo tipado mantém a validação do arquivo mesmo quando não está em uma cena.
CREATE OR REPLACE FUNCTION validar_arquivo_midia_mesma_obra()
RETURNS TRIGGER AS $$
DECLARE obra_arquivo UUID; arquivo_ativo BOOLEAN;
BEGIN
    IF NEW.arquivo_id IS NULL THEN RETURN NEW; END IF;
    SELECT livro_id, ativo INTO obra_arquivo, arquivo_ativo
      FROM arquivos_midia WHERE id = NEW.arquivo_id;
    IF obra_arquivo IS NULL OR obra_arquivo <> NEW.livro_id THEN
        RAISE EXCEPTION 'O arquivo gerenciado e o conteúdo devem pertencer à mesma obra.' USING ERRCODE = '23514';
    END IF;
    IF TG_OP = 'INSERT' AND arquivo_ativo IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Arquivos gerenciados inativos não podem receber novas associações.' USING ERRCODE = '23514';
    ELSIF TG_OP = 'UPDATE' AND NEW.arquivo_id IS DISTINCT FROM OLD.arquivo_id
       AND arquivo_ativo IS DISTINCT FROM TRUE THEN
        RAISE EXCEPTION 'Arquivos gerenciados inativos não podem receber novas associações.' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER trg_cena_imagens_arquivo_mesma_obra ON cena_imagens;
DROP TRIGGER trg_cena_audios_arquivo_mesma_obra ON cena_audios;
DROP TRIGGER trg_cena_videos_arquivo_mesma_obra ON cena_videos;
CREATE TRIGGER trg_cena_imagens_arquivo_mesma_obra
    BEFORE INSERT OR UPDATE OF livro_id, arquivo_id ON cena_imagens
    FOR EACH ROW EXECUTE FUNCTION validar_arquivo_midia_mesma_obra();
CREATE TRIGGER trg_cena_audios_arquivo_mesma_obra
    BEFORE INSERT OR UPDATE OF livro_id, arquivo_id ON cena_audios
    FOR EACH ROW EXECUTE FUNCTION validar_arquivo_midia_mesma_obra();
CREATE TRIGGER trg_cena_videos_arquivo_mesma_obra
    BEFORE INSERT OR UPDATE OF livro_id, arquivo_id ON cena_videos
    FOR EACH ROW EXECUTE FUNCTION validar_arquivo_midia_mesma_obra();

COMMIT;
