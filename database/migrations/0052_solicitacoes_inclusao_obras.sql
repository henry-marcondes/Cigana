BEGIN;

CREATE TABLE solicitacoes_inclusao_obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    autor_id UUID NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    resumo TEXT,
    categoria_id UUID NOT NULL,
    classificacao_indicativa_id UUID NOT NULL,
    idioma_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    avaliado_por UUID,
    avaliado_em TIMESTAMPTZ,
    motivo_rejeicao TEXT,
    livro_id UUID UNIQUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitacoes_inclusao_autor FOREIGN KEY (autor_id)
        REFERENCES autores(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_solicitacoes_inclusao_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_solicitacoes_inclusao_classificacao FOREIGN KEY (classificacao_indicativa_id)
        REFERENCES classificacoes_indicativas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_solicitacoes_inclusao_idioma FOREIGN KEY (idioma_id)
        REFERENCES idiomas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_solicitacoes_inclusao_avaliador FOREIGN KEY (avaliado_por)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_solicitacoes_inclusao_livro FOREIGN KEY (livro_id)
        REFERENCES livros(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT ck_solicitacoes_inclusao_status CHECK (
        status IN ('PENDENTE', 'RECUSADA', 'APROVADA', 'UTILIZADA')
    ),
    CONSTRAINT ck_solicitacoes_inclusao_avaliacao CHECK (
        (status = 'PENDENTE' AND avaliado_por IS NULL AND avaliado_em IS NULL AND motivo_rejeicao IS NULL)
        OR (status = 'RECUSADA' AND avaliado_por IS NOT NULL AND avaliado_em IS NOT NULL AND motivo_rejeicao IS NOT NULL)
        OR (status IN ('APROVADA', 'UTILIZADA') AND avaliado_por IS NOT NULL AND avaliado_em IS NOT NULL AND motivo_rejeicao IS NULL)
    ),
    CONSTRAINT ck_solicitacoes_inclusao_utilizada CHECK (
        (status = 'UTILIZADA' AND livro_id IS NOT NULL)
        OR (status <> 'UTILIZADA' AND livro_id IS NULL)
    )
);

CREATE INDEX idx_solicitacoes_inclusao_autor ON solicitacoes_inclusao_obras (autor_id, criado_em DESC);
CREATE INDEX idx_solicitacoes_inclusao_status ON solicitacoes_inclusao_obras (status, criado_em);

CREATE TABLE historico_solicitacoes_inclusao_obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id UUID NOT NULL,
    evento VARCHAR(20) NOT NULL,
    dados_proposta JSONB NOT NULL,
    realizado_por UUID NOT NULL,
    motivo TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historico_solicitacao_inclusao FOREIGN KEY (solicitacao_id)
        REFERENCES solicitacoes_inclusao_obras(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_historico_solicitacao_inclusao_usuario FOREIGN KEY (realizado_por)
        REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT ck_historico_solicitacao_inclusao_evento CHECK (
        evento IN ('CRIADA', 'EDITADA', 'REENVIADA', 'APROVADA', 'RECUSADA', 'UTILIZADA')
    )
);

CREATE INDEX idx_historico_solicitacao_inclusao ON historico_solicitacoes_inclusao_obras (solicitacao_id, criado_em);

COMMIT;
