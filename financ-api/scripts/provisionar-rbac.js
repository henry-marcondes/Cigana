const { criarPool } = require('../src/db/pool');

const CODIGO_PAPEL_ADMIN = 'ADMIN_RBAC_FINANCEIRO';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PERMISSOES_RBAC = [
    {
        codigo: 'financeiro.rbac.consultar',
        nome: 'Consultar RBAC financeiro',
        descricao: 'Permite consultar papéis, permissões e associações do RBAC financeiro.'
    },
    {
        codigo: 'financeiro.rbac.atribuir',
        nome: 'Atribuir acessos financeiros',
        descricao: 'Permite atribuir papéis e permissões financeiras.'
    },
    {
        codigo: 'financeiro.rbac.revogar',
        nome: 'Revogar acessos financeiros',
        descricao: 'Permite revogar papéis e permissões financeiras.'
    }
];

class ProvisionamentoRbacError extends Error {}

function obterUsuarioAlvo(argumentos) {
    if (
        argumentos.length !== 4 ||
        argumentos[0] !== '--usuario-id' ||
        argumentos[2] !== '--confirmar-papel-plataforma' ||
        argumentos[3] !== 'ADMINISTRADOR'
    ) {
        throw new ProvisionamentoRbacError(
            'Uso: node scripts/provisionar-rbac.js --usuario-id <UUID> --confirmar-papel-plataforma ADMINISTRADOR'
        );
    }

    const usuarioIdExterno = argumentos[1];
    if (!UUID_REGEX.test(usuarioIdExterno)) {
        throw new ProvisionamentoRbacError('O usuário informado precisa ter um UUID válido.');
    }

    return usuarioIdExterno;
}

async function provisionarRbac(client, usuarioIdExterno) {
    await client.query('BEGIN');

    try {
        await client.query(`
            INSERT INTO financeiro.papeis_financeiros (
                codigo, nome, descricao, criado_por_usuario_id_externo
            )
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (codigo) DO NOTHING
        `, [
            CODIGO_PAPEL_ADMIN,
            'Administrador do RBAC Financeiro',
            'Gerencia somente consulta, atribuição e revogação de acessos financeiros.',
            usuarioIdExterno
        ]);

        const papelResult = await client.query(`
            SELECT id, ativo
              FROM financeiro.papeis_financeiros
             WHERE codigo = $1
             FOR UPDATE
        `, [CODIGO_PAPEL_ADMIN]);
        const papel = papelResult.rows[0];

        if (!papel || !papel.ativo) {
            throw new ProvisionamentoRbacError(
                'O papel administrativo financeiro não existe ou está inativo; nenhuma atribuição foi reativada.'
            );
        }

        const permissoesIds = [];
        for (const permissao of PERMISSOES_RBAC) {
            await client.query(`
                INSERT INTO financeiro.permissoes_financeiras (
                    codigo, nome, descricao, criado_por_usuario_id_externo
                )
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (codigo) DO NOTHING
            `, [permissao.codigo, permissao.nome, permissao.descricao, usuarioIdExterno]);

            const permissaoResult = await client.query(`
                SELECT id, ativo
                  FROM financeiro.permissoes_financeiras
                 WHERE codigo = $1
                 FOR UPDATE
            `, [permissao.codigo]);
            const registro = permissaoResult.rows[0];

            if (!registro || !registro.ativo) {
                throw new ProvisionamentoRbacError(
                    `A permissão ${permissao.codigo} não existe ou está inativa; nenhuma atribuição foi reativada.`
                );
            }

            permissoesIds.push(registro.id);
        }

        const outrosUsuarios = await client.query(`
            SELECT 1
              FROM financeiro.usuario_papeis_financeiros
             WHERE papel_id = $1
               AND ativo = TRUE
               AND usuario_id_externo <> $2
             LIMIT 1
        `, [papel.id, usuarioIdExterno]);

        const permissoesAtivasResult = await client.query(`
            SELECT permissao.codigo
              FROM financeiro.papel_permissoes_financeiras AS papel_permissao
              INNER JOIN financeiro.permissoes_financeiras AS permissao
                ON permissao.id = papel_permissao.permissao_id
               AND permissao.ativo = TRUE
             WHERE papel_permissao.papel_id = $1
               AND papel_permissao.ativo = TRUE
               AND permissao.codigo = ANY($2::varchar[])
        `, [papel.id, PERMISSOES_RBAC.map(({ codigo }) => codigo)]);
        const codigosAtivos = new Set(
            permissoesAtivasResult.rows.map(({ codigo }) => codigo)
        );
        const faltantes = PERMISSOES_RBAC
            .filter(({ codigo }) => !codigosAtivos.has(codigo));

        if (outrosUsuarios.rowCount > 0 && faltantes.length > 0) {
            throw new ProvisionamentoRbacError(
                'O papel administrativo já possui outros usuários ativos e permissões incompletas; revise as atribuições manualmente.'
            );
        }

        for (const permissaoId of permissoesIds) {
            await client.query(`
                INSERT INTO financeiro.papel_permissoes_financeiras (
                    papel_id, permissao_id, atribuido_por_usuario_id_externo
                )
                VALUES ($1, $2, $3)
                ON CONFLICT (papel_id, permissao_id) DO NOTHING
            `, [papel.id, permissaoId, usuarioIdExterno]);
        }

        const permissoesFinais = await client.query(`
            SELECT permissao.codigo
              FROM financeiro.papel_permissoes_financeiras AS papel_permissao
              INNER JOIN financeiro.permissoes_financeiras AS permissao
                ON permissao.id = papel_permissao.permissao_id
               AND permissao.ativo = TRUE
             WHERE papel_permissao.papel_id = $1
               AND papel_permissao.ativo = TRUE
               AND permissao.codigo = ANY($2::varchar[])
        `, [papel.id, PERMISSOES_RBAC.map(({ codigo }) => codigo)]);

        if (new Set(permissoesFinais.rows.map(({ codigo }) => codigo)).size !== PERMISSOES_RBAC.length) {
            throw new ProvisionamentoRbacError(
                'Uma ou mais atribuições de permissão estão inativas; nenhuma foi reativada.'
            );
        }

        await client.query(`
            INSERT INTO financeiro.usuarios_financeiros (
                usuario_id_externo, criado_por_usuario_id_externo
            )
            VALUES ($1, $2)
            ON CONFLICT (usuario_id_externo) DO NOTHING
        `, [usuarioIdExterno, usuarioIdExterno]);

        const usuarioResult = await client.query(`
            SELECT ativo
              FROM financeiro.usuarios_financeiros
             WHERE usuario_id_externo = $1
             FOR UPDATE
        `, [usuarioIdExterno]);

        if (!usuarioResult.rows[0] || !usuarioResult.rows[0].ativo) {
            throw new ProvisionamentoRbacError(
                'O usuário financeiro informado não existe ou está inativo; nenhuma atribuição foi reativada.'
            );
        }

        await client.query(`
            INSERT INTO financeiro.usuario_papeis_financeiros (
                usuario_id_externo,
                papel_id,
                atribuido_por_usuario_id_externo
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (usuario_id_externo, papel_id) DO NOTHING
        `, [usuarioIdExterno, papel.id, usuarioIdExterno]);

        const associacaoResult = await client.query(`
            SELECT ativo
              FROM financeiro.usuario_papeis_financeiros
             WHERE usuario_id_externo = $1
               AND papel_id = $2
             FOR UPDATE
        `, [usuarioIdExterno, papel.id]);

        if (!associacaoResult.rows[0] || !associacaoResult.rows[0].ativo) {
            throw new ProvisionamentoRbacError(
                'A associação do usuário ao papel administrativo está inativa; ela não foi reativada.'
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

async function executar(argumentos = process.argv.slice(2)) {
    const usuarioIdExterno = obterUsuarioAlvo(argumentos);
    const pool = criarPool();
    let client;

    try {
        client = await pool.connect();
        await provisionarRbac(client, usuarioIdExterno);
        console.log('Provisionamento RBAC concluído para o usuário indicado.');
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

if (require.main === module) {
    executar().catch((error) => {
        if (error instanceof ProvisionamentoRbacError) {
            console.error(`Provisionamento RBAC abortado: ${error.message}`);
        } else {
            console.error('Provisionamento RBAC falhou; verifique a conexão e a estrutura do financeiro_db.');
        }
        process.exitCode = 1;
    });
}

module.exports = {
    CODIGO_PAPEL_ADMIN,
    PERMISSOES_RBAC,
    obterUsuarioAlvo,
    provisionarRbac
};
