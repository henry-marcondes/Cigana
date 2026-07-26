BEGIN;

CREATE TABLE categorias (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    biblioteca_id UUID NOT NULL,

    categoria_pai_id UUID,

    nome VARCHAR(150) NOT NULL,

    slug VARCHAR(150) NOT NULL,

    descricao TEXT,

    ordem_exibicao INTEGER NOT NULL DEFAULT 0,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_categorias_biblioteca_slug
        UNIQUE (biblioteca_id, slug),

    CONSTRAINT fk_categorias_biblioteca
        FOREIGN KEY (biblioteca_id)
        REFERENCES bibliotecas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_categorias_pai
        FOREIGN KEY (categoria_pai_id)
        REFERENCES categorias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

COMMIT;
