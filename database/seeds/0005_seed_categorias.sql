BEGIN;

-- =====================================================
-- Biblioteca Pública
-- =====================================================

INSERT INTO categorias (
    biblioteca_id,
    nome,
    slug,
    descricao,
    ordem_exibicao
)
SELECT
    b.id,
    v.nome,
    v.slug,
    v.descricao,
    v.ordem
FROM bibliotecas b
CROSS JOIN (
    VALUES
        ('Romance', 'romance', 'Livros de romance.', 1),
        ('Contos', 'contos', 'Contos e histórias curtas.', 2),
        ('História', 'historia', 'Livros de história.', 3),
        ('Educação', 'educacao', 'Conteúdo educacional.', 4),
        ('Tecnologia', 'tecnologia', 'Livros de tecnologia.', 5),
        ('Ficção Científica', 'ficcao-cientifica', 'Ficção científica.', 6),
        ('Infantil', 'infantil', 'Conteúdo infantil.', 7)
) AS v(nome, slug, descricao, ordem)
WHERE b.slug = 'biblioteca-publica'

ON CONFLICT (biblioteca_id, slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ordem_exibicao = EXCLUDED.ordem_exibicao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

INSERT INTO categorias (
    biblioteca_id,
    nome,
    slug,
    descricao,
    ordem_exibicao
)
SELECT
    b.id,
    v.nome,
    v.slug,
    v.descricao,
    v.ordem
FROM bibliotecas b
CROSS JOIN (
    VALUES
        ('Literatura Adulta', 'literatura-adulta', 'Conteúdo adulto.', 1),
        ('Contos Sensuais', 'contos-sensuais', 'Contos sensuais.', 2),
        ('Fantasias Adultas', 'fantasias-adultas', 'Fantasias para adultos.', 3)
) AS v(nome, slug, descricao, ordem)
WHERE b.slug = 'biblioteca-privada'

ON CONFLICT (biblioteca_id, slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ordem_exibicao = EXCLUDED.ordem_exibicao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

INSERT INTO categorias (
    biblioteca_id,
    nome,
    slug,
    descricao,
    ordem_exibicao
)
SELECT
    b.id,
    v.nome,
    v.slug,
    v.descricao,
    v.ordem
FROM bibliotecas b
CROSS JOIN (
    VALUES
        ('Material Didático', 'material-didatico', 'Material para ensino.', 1),
        ('Treinamentos', 'treinamentos', 'Cursos e treinamentos.', 2),
        ('Apostilas', 'apostilas', 'Apostilas diversas.', 3),
        ('Documentação', 'documentacao', 'Documentação técnica.', 4)
) AS v(nome, slug, descricao, ordem)
WHERE b.slug = 'biblioteca-organizacao'

ON CONFLICT (biblioteca_id, slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ordem_exibicao = EXCLUDED.ordem_exibicao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
