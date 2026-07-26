BEGIN;

INSERT INTO status_livro (
    nome,
    slug,
    descricao
)
VALUES
    (
        'Em elaboração',
        'em-elaboracao',
        'Livro em fase de criação.'
    ),
    (
        'Em revisão',
        'em-revisao',
        'Livro aguardando revisão.'
    ),
    (
        'Publicado',
        'publicado',
        'Livro disponível para leitura.'
    ),
    (
        'Arquivado',
        'arquivado',
        'Livro retirado de circulação.'
    )

ON CONFLICT (slug)
DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    ativo = TRUE,
    atualizado_em = CURRENT_TIMESTAMP;

COMMIT;

