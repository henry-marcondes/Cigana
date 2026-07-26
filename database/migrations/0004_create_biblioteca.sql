BEGIN;

CREATE TABLE bibliotecas (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tipo_biblioteca_id UUID NOT NULL,

    nome VARCHAR(150) NOT NULL,

    slug VARCHAR(150) NOT NULL,

    descricao TEXT,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_bibliotecas_nome
        UNIQUE (nome),

    CONSTRAINT uq_bibliotecas_slug
        UNIQUE (slug),

    CONSTRAINT fk_bibliotecas_tipo
        FOREIGN KEY (tipo_biblioteca_id)
        REFERENCES tipos_biblioteca(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

COMMIT;
