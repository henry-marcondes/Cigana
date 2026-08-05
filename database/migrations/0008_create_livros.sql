-- =====================================================
-- Migration: 0008_create_livro.sql
-- Descrição : Relacionamento entre livros
-- Projeto   : Plataforma Ciganas
-- PostgreSQL: 16+
-- =====================================================
BEGIN;

CREATE TABLE livros (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    categoria_id UUID NOT NULL,

    classificacao_indicativa_id UUID NOT NULL,

    idioma_id UUID NOT NULL,

    status_livro_id UUID NOT NULL,

    visibilidade_livro_id UUID NOT NULL,

    titulo VARCHAR(255) NOT NULL,

    slug VARCHAR(255) NOT NULL,

    resumo TEXT,

    capa_url TEXT,

    isbn VARCHAR(20),

    ano_publicacao INTEGER,

    data_publicacao TIMESTAMPTZ,

    ordem_exibicao INTEGER NOT NULL DEFAULT 0,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_livros_slug
        UNIQUE (slug),

    CONSTRAINT fk_livros_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_livros_classificacao_indicativa
        FOREIGN KEY (classificacao_indicativa_id)
        REFERENCES classificacoes_indicativas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_livros_idioma
        FOREIGN KEY (idioma_id)
        REFERENCES idiomas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_livros_status
        FOREIGN KEY (status_livro_id)
        REFERENCES status_livro(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_livros_visibilidade
        FOREIGN KEY (visibilidade_livro_id)
        REFERENCES visibilidade_livro(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

CREATE INDEX idx_livros_categoria
    ON livros (categoria_id);

CREATE INDEX idx_livros_classificacao
    ON livros (classificacao_indicativa_id);

CREATE INDEX idx_livros_idioma
    ON livros (idioma_id);

CREATE INDEX idx_livros_status
    ON livros (status_livro_id);

CREATE INDEX idx_livros_visibilidade
    ON livros (visibilidade_livro_id);

CREATE INDEX idx_livros_titulo
    ON livros (titulo);

CREATE INDEX idx_livros_ativo
    ON livros (ativo);

COMMIT;
