CREATE TABLE papel_permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    papel_id UUID NOT NULL,
    permissao_id UUID NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_papel_permissoes_papel
        FOREIGN KEY (papel_id)
        REFERENCES papeis(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_papel_permissoes_permissao
        FOREIGN KEY (permissao_id)
        REFERENCES permissoes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_papel_permissoes
        UNIQUE (papel_id, permissao_id)
);

CREATE INDEX idx_papel_permissoes_papel_id
    ON papel_permissoes (papel_id);

CREATE INDEX idx_papel_permissoes_permissao_id
    ON papel_permissoes (permissao_id);
