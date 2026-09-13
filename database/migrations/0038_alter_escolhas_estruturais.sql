ALTER TABLE escolhas
    ALTER COLUMN cena_destino_id SET NOT NULL;

CREATE UNIQUE INDEX  uq_escolhas_origem_ordem ON escolhas (cena_origem_id, ordem_exibicao)
    WHERE ativo = TRUE;
