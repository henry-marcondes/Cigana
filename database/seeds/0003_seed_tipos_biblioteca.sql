BEGIN;

INSERT INTO tipos_biblioteca (
    nome,
    slug,
    descricao
)
VALUES
    (
        'Pública',
        'publica',
        'Bibliotecas abertas a todos os usuários.'
    ),
    (
        'Privada',
        'privada',
        'Bibliotecas com acesso restrito.'
    ),
    (
        'Organização',
        'organizacao',
        'Bibliotecas destinadas a escolas, igrejas, empresas e outras instituições.'
    )

ON CONFLICT (slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
