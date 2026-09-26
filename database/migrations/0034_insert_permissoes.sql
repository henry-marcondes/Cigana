CREATE TABLE permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO permissoes (
    nome,
    codigo,
    descricao
)
VALUES
    (
        'Criar obra',
        'obra.criar',
        'Permite criar uma nova obra.'
    ),
    (
        'Visualizar obra',
        'obra.visualizar',
        'Permite visualizar informações de uma obra.'
    ),
    (
        'Editar obra',
        'obra.editar',
        'Permite editar uma obra.'
    ),
    (
        'Publicar obra',
        'obra.publicar',
        'Permite publicar uma obra.'
    ),
    (
        'Excluir obra',
        'obra.excluir',
        'Permite excluir uma obra.'
    ),
    (
        'Visualizar usuário',
        'usuario.visualizar',
        'Permite visualizar informações de usuários.'
    ),
    (
        'Editar usuário',
        'usuario.editar',
        'Permite editar informações de usuários.'
    ),
    (
        'Bloquear usuário',
        'usuario.bloquear',
        'Permite bloquear um usuário.'
    ),
    (
        'Visualizar autor',
        'autor.visualizar',
        'Permite visualizar informações de autores.'
    ),
    (
        'Editar autor',
        'autor.editar',
        'Permite editar informações de autores.'
    ),
    (
        'Visualizar moderação',
        'moderacao.visualizar',
        'Permite visualizar conteúdo destinado à moderação.'
    ),
    (
        'Operar moderação',
        'moderacao.operar',
        'Permite executar ações de moderação.'
    ),
    (
        'Visualizar plataforma',
        'plataforma.visualizar',
        'Permite visualizar informações administrativas da plataforma.'
    ),
    (
        'Configurar plataforma',
        'plataforma.configurar',
        'Permite configurar aspectos da plataforma.'
    ),
    (
        'Visualizar financeiro',
        'financeiro.visualizar',
        'Permite visualizar informações financeiras.'
    ),
    (
        'Operar financeiro',
        'financeiro.operar',
        'Permite executar operações financeiras.'
    );
