BEGIN;

-- Identificação técnica do capítulo editorial interno e da Cena Padrão.
-- Os defaults preservam todas as obras já existentes como capítulos e cenas normais.
ALTER TABLE capitulos
    ADD COLUMN capitulo_destinos_pendentes BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE cenas
    ADD COLUMN cena_padrao BOOLEAN NOT NULL DEFAULT FALSE;

-- Uma obra pode possuir no máximo um capítulo interno de destinos pendentes.
CREATE UNIQUE INDEX uq_capitulos_destinos_pendentes_livro
    ON capitulos (livro_id)
    WHERE capitulo_destinos_pendentes = TRUE;

-- O capítulo interno é dedicado à Cena Padrão: uma única cena especial por capítulo.
CREATE UNIQUE INDEX uq_cenas_padrao_capitulo
    ON cenas (capitulo_id)
    WHERE cena_padrao = TRUE;

CREATE OR REPLACE FUNCTION validar_cena_padrao_capitulo_interno()
RETURNS TRIGGER AS $$
DECLARE capitulo_interno BOOLEAN;
BEGIN
    -- Serializa a validação com alterações no marcador do capítulo.
    SELECT capitulo_destinos_pendentes
      INTO capitulo_interno
      FROM capitulos
     WHERE id = NEW.capitulo_id
     FOR UPDATE;

    IF capitulo_interno IS DISTINCT FROM NEW.cena_padrao THEN
        RAISE EXCEPTION
            'O capítulo interno de destinos pendentes deve conter somente a Cena Padrão, e a Cena Padrão deve pertencer a esse capítulo.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_cena_padrao_capitulo_interno
    BEFORE INSERT OR UPDATE ON cenas
    FOR EACH ROW
    EXECUTE FUNCTION validar_cena_padrao_capitulo_interno();

-- Impede alterar o marcador do capítulo quando as cenas existentes
-- deixariam de respeitar a correspondência entre os dois marcadores.
CREATE OR REPLACE FUNCTION validar_marcador_capitulo_destinos_pendentes()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
          FROM cenas
         WHERE capitulo_id = NEW.id
           AND cena_padrao IS DISTINCT FROM NEW.capitulo_destinos_pendentes
    ) THEN
        RAISE EXCEPTION
            'Não é possível alterar o marcador do capítulo porque existem cenas vinculadas incompatíveis com o novo estado.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_marcador_capitulo_destinos_pendentes
    BEFORE UPDATE OF capitulo_destinos_pendentes ON capitulos
    FOR EACH ROW
    WHEN (OLD.capitulo_destinos_pendentes IS DISTINCT FROM NEW.capitulo_destinos_pendentes)
    EXECUTE FUNCTION validar_marcador_capitulo_destinos_pendentes();

COMMIT;
