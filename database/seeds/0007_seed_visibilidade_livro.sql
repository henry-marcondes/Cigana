BEGIN;

INSERT INTO visibilidade_livro (
    nome,
    slug,
    descricao
)
VALUES
    (
        'Pública',
        'publica',
        'Livro visível para todos os usuários.'
    ),
    (
        'Assinantes',
        'assinantes',
        'Livro disponível apenas para assinantes.'
    ),
    (
        'Privada',
        'privada',
        'Livro disponível apenas para usuários autorizados.'
    ),
    (
        'Rascunho',
        'rascunho',
        'Livro visível apenas para autores e administradores.'
    )

ON CONFLICT (slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

COMMIT;
