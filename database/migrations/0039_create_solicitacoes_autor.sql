-- =====================================================
-- Migration: 0039_create_solicitacoes_autor.sql
-- Descrição : Solicitações para atuação como Autor
-- Projeto   : Plataforma Cigana
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

CREATE TABLE solicitacoes_autor (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID NOT NULL,

    -- Dados editoriais do candidato
    nome_publico TEXT NOT NULL,
    biografia TEXT,
    foto_url TEXT,

    -- Proposta da futura Obra
    titulo_provisorio VARCHAR(255) NOT NULL,
    resumo TEXT,

    categoria_id UUID NOT NULL,
    classificacao_indicativa_id UUID NOT NULL,
    idioma_id UUID NOT NULL,

    -- Estado do processo de candidatura
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',

    -- Avaliação da candidatura
    avaliado_por UUID,
    avaliado_em TIMESTAMPTZ,
    motivo_recusa TEXT,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_solicitacoes_autor_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_solicitacoes_autor_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_solicitacoes_autor_classificacao
        FOREIGN KEY (classificacao_indicativa_id)
        REFERENCES classificacoes_indicativas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_solicitacoes_autor_idioma
        FOREIGN KEY (idioma_id)
        REFERENCES idiomas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_solicitacoes_autor_avaliador
        FOREIGN KEY (avaliado_por)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT ck_solicitacoes_autor_status
        CHECK (
            status IN (
                'PENDENTE',
                'APROVADA',
                'RECUSADA'
            )
        ),

    CONSTRAINT ck_solicitacoes_autor_avaliacao
        CHECK (
            (
                status = 'PENDENTE'
                AND avaliado_por IS NULL
                AND avaliado_em IS NULL
                AND motivo_recusa IS NULL
            )
            OR
            (
                status = 'APROVADA'
                AND avaliado_por IS NOT NULL
                AND avaliado_em IS NOT NULL
                AND motivo_recusa IS NULL
            )
            OR
            (
                status = 'RECUSADA'
                AND avaliado_por IS NOT NULL
                AND avaliado_em IS NOT NULL
                AND motivo_recusa IS NOT NULL
            )
        )
);

CREATE INDEX idx_solicitacoes_autor_usuario
    ON solicitacoes_autor (usuario_id);

CREATE INDEX idx_solicitacoes_autor_status
    ON solicitacoes_autor (status);

CREATE INDEX idx_solicitacoes_autor_avaliado_por
    ON solicitacoes_autor (avaliado_por);

CREATE INDEX idx_solicitacoes_autor_criado_em
    ON solicitacoes_autor (criado_em);

CREATE UNIQUE INDEX uq_solicitacoes_autor_usuario_pendente
    ON solicitacoes_autor (usuario_id)
    WHERE status = 'PENDENTE';

COMMIT;
