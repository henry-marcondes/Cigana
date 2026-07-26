BEGIN;

CREATE TABLE classificacoes_indicativas (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(50) NOT NULL,

    idade_minima SMALLINT NOT NULL,

    descricao TEXT,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_classificacao_nome UNIQUE (nome),

    CONSTRAINT uq_classificacao_idade UNIQUE (idade_minima),

    CONSTRAINT chk_classificacao_idade
        CHECK (idade_minima >= 0)

);

COMMIT;
