BEGIN;

CREATE TABLE navegacoes_estruturais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cena_origem_id UUID NOT NULL,
    cena_destino_id UUID NOT NULL,
    rotulo TEXT NOT NULL,
    ordem_exibicao INTEGER NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_navegacoes_estruturais_rotulo
        CHECK (length(trim(rotulo)) > 0),
    CONSTRAINT ck_navegacoes_estruturais_ordem
        CHECK (ordem_exibicao > 0),
    CONSTRAINT fk_navegacoes_estruturais_cena_origem
        FOREIGN KEY (cena_origem_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_navegacoes_estruturais_cena_destino
        FOREIGN KEY (cena_destino_id)
        REFERENCES cenas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_navegacoes_estruturais_origem_ordem
    ON navegacoes_estruturais (cena_origem_id, ordem_exibicao)
    WHERE ativo = TRUE;

CREATE INDEX idx_navegacoes_estruturais_destino
    ON navegacoes_estruturais (cena_destino_id)
    WHERE ativo = TRUE;

COMMIT;
