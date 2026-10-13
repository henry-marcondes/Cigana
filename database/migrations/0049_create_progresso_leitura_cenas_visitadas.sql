BEGIN;

CREATE TABLE progresso_leitura_cenas_visitadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progresso_id UUID NOT NULL,
    cena_id UUID NOT NULL,
    visitada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_progresso_leitura_cenas_visitadas
        UNIQUE (progresso_id, cena_id),
    CONSTRAINT fk_progresso_leitura_cenas_visitadas_progresso
        FOREIGN KEY (progresso_id)
        REFERENCES progresso_leitura(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_progresso_leitura_cenas_visitadas_cena
        FOREIGN KEY (cena_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_progresso_leitura_cenas_visitadas_cena
    ON progresso_leitura_cenas_visitadas (cena_id);

INSERT INTO progresso_leitura_cenas_visitadas (
    progresso_id,
    cena_id,
    visitada_em
)
SELECT
    p.id,
    c.id,
    p.ultima_leitura_em
  FROM progresso_leitura p
  INNER JOIN cenas c
    ON c.id = p.cena_atual_id
   AND c.ativo = TRUE
  INNER JOIN capitulos cap
    ON cap.id = c.capitulo_id
   AND cap.livro_id = p.livro_id
   AND cap.ativo = TRUE
 WHERE p.ativo = TRUE
ON CONFLICT (progresso_id, cena_id) DO NOTHING;

WITH totais AS (
    SELECT
        cap.livro_id,
        COUNT(c.id)::INTEGER AS quantidade
      FROM capitulos cap
      LEFT JOIN cenas c
        ON c.capitulo_id = cap.id
       AND c.ativo = TRUE
     WHERE cap.ativo = TRUE
     GROUP BY cap.livro_id
),
visitas AS (
    SELECT
        progresso_id,
        COUNT(DISTINCT cena_id)::INTEGER AS quantidade
      FROM progresso_leitura_cenas_visitadas
     GROUP BY progresso_id
),
calculos AS (
    SELECT
        p.id,
        COALESCE(v.quantidade, 0) AS visitadas,
        t.quantidade AS total
      FROM progresso_leitura p
      INNER JOIN totais t
        ON t.livro_id = p.livro_id
      LEFT JOIN visitas v
        ON v.progresso_id = p.id
     WHERE p.ativo = TRUE
       AND t.quantidade > 0
)
UPDATE progresso_leitura p
   SET percentual_concluido = LEAST(
           100::NUMERIC,
           GREATEST(
               0::NUMERIC,
               ROUND((calculos.visitadas::NUMERIC * 100) / calculos.total::NUMERIC, 2)
           )
       ),
       atualizado_em = NOW()
  FROM calculos
 WHERE p.id = calculos.id;

COMMIT;
