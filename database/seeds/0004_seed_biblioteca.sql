BEGIN;

INSERT INTO bibliotecas (
    tipo_biblioteca_id,
    nome,
    slug,
    descricao
)
SELECT
    id,
    'Biblioteca Pública',
    'biblioteca-publica',
    'Biblioteca destinada ao catálogo público.'
FROM tipos_biblioteca
WHERE slug = 'publica'

ON CONFLICT (slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

INSERT INTO bibliotecas (
    tipo_biblioteca_id,
    nome,
    slug,
    descricao
)
SELECT
    id,
    'Biblioteca Privada',
    'biblioteca-privada',
    'Biblioteca destinada a conteúdos privados.'
FROM tipos_biblioteca
WHERE slug = 'privada'

ON CONFLICT (slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

INSERT INTO bibliotecas (
    tipo_biblioteca_id,
    nome,
    slug,
    descricao
)
SELECT
    id,
    'Biblioteca Organização',
    'biblioteca-organizacao',
    'Biblioteca destinada a instituições e organizações.'
FROM tipos_biblioteca
WHERE slug = 'organizacao'

ON CONFLICT (slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
