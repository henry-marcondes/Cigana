BEGIN;

CREATE TABLE status_livro (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(100) NOT NULL,

    slug VARCHAR(100) NOT NULL,

    descricao TEXT,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_status_livro_nome
        UNIQUE (nome),

    CONSTRAINT uq_status_livro_slug
        UNIQUE (slug)

);

COMMIT;
