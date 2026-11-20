const assert = require('node:assert/strict');
const { generateKeyPairSync, randomUUID } = require('node:crypto');
const { test } = require('node:test');
const jwt = require('jsonwebtoken');

const USUARIO_FINANCEIRO_ID = 'e4fc3e89-16b3-4e56-8353-3e7c7676083a';
const USUARIO_CIGANA_ID = '6ad662a5-4bb5-4111-bb05-c9b03c4abc13';
const PERMISSAO_EXIGIDA = 'financeiro.rbac.consultar';

function criarToken(usuarioId, privateKey, kid, issuer, audience) {
    return jwt.sign({ id: usuarioId }, privateKey, {
        algorithm: 'RS256',
        keyid: kid,
        issuer,
        audience,
        subject: usuarioId,
        expiresIn: 3600
    });
}

async function iniciarServidor(app) {
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    return server;
}

test('rota financeira aplica autenticação RS256 e RBAC PostgreSQL via HTTP', async (t) => {
    const nomesVariaveis = [
        'FINANC_API_JWT_PUBLIC_KEY',
        'FINANC_API_JWT_KID',
        'FINANC_API_JWT_ISSUER',
        'FINANC_API_JWT_AUDIENCE'
    ];
    const anteriores = Object.fromEntries(
        nomesVariaveis.map((nome) => [nome, process.env[nome]])
    );
    const parChaves = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const kid = 'financ-api-route-integration-test';
    const audience = 'cigana-financ-api.integration.test';
    const databasePool = require('../src/db/pool');
    const poolLeitura = databasePool.criarPool();
    t.after(() => poolLeitura.end());
    const plataforma = await poolLeitura.query(`
        SELECT issuer
          FROM financeiro.plataformas
         WHERE codigo = 'CIGANA'
           AND ativo = TRUE
    `);
    assert.equal(plataforma.rowCount, 1, 'issuer confiável da CIGANA deve estar cadastrado');
    const issuer = plataforma.rows[0].issuer;
    Object.assign(process.env, {
        FINANC_API_JWT_PUBLIC_KEY: parChaves.publicKey,
        FINANC_API_JWT_KID: kid,
        FINANC_API_JWT_ISSUER: issuer,
        FINANC_API_JWT_AUDIENCE: audience
    });

    const { criarApp } = require('../src/app');
    const poolAutorizacao = databasePool.criarPool();
    databasePool.definirPool(poolAutorizacao);
    const server = await iniciarServidor(criarApp());
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/financeiro/usuario-autenticado`;
    const tokenAutorizado = criarToken(
        USUARIO_CIGANA_ID,
        parChaves.privateKey,
        kid,
        issuer,
        audience
    );

    t.after(async () => {
        databasePool.definirPool(null);
        await poolAutorizacao.end();
        await new Promise((resolve) => server.close(resolve));
        for (const [nome, valor] of Object.entries(anteriores)) {
            if (valor === undefined) delete process.env[nome];
            else process.env[nome] = valor;
        }
    });

    let candidatos;
    const registro = await poolLeitura.query(`
            SELECT usuario.ativo,
                   identidade.usuario_id_externo,
                   identidade.usuario_financeiro_id,
                   EXISTS (
                       SELECT 1
                         FROM financeiro.usuario_papeis_financeiros AS usuario_papel
                         INNER JOIN financeiro.papeis_financeiros AS papel
                           ON papel.id = usuario_papel.papel_id AND papel.ativo = TRUE
                         INNER JOIN financeiro.papel_permissoes_financeiras AS papel_permissao
                           ON papel_permissao.papel_id = papel.id AND papel_permissao.ativo = TRUE
                         INNER JOIN financeiro.permissoes_financeiras AS permissao
                           ON permissao.id = papel_permissao.permissao_id AND permissao.ativo = TRUE
                        WHERE usuario_papel.usuario_financeiro_id = usuario.id
                          AND usuario_papel.ativo = TRUE
                          AND permissao.codigo = $2
                   ) AS possui_permissao
              FROM financeiro.usuarios_financeiros AS usuario
              INNER JOIN financeiro.identidades_externas AS identidade
                ON identidade.usuario_financeiro_id = usuario.id
              INNER JOIN financeiro.plataformas AS plataforma
                ON plataforma.id = identidade.plataforma_id
             WHERE usuario.id = $1
               AND plataforma.codigo = 'CIGANA'
               AND identidade.usuario_id_externo = $3
               AND identidade.ativo = TRUE
               AND plataforma.ativo = TRUE
        `, [USUARIO_FINANCEIRO_ID, PERMISSAO_EXIGIDA, USUARIO_CIGANA_ID]);
    assert.equal(registro.rows[0]?.ativo, true, 'usuário financeiro provisionado deve estar ativo');
    assert.equal(registro.rows[0]?.possui_permissao, true, 'permissão precisa existir e estar atribuída no banco');
    assert.equal(registro.rows[0]?.usuario_id_externo, USUARIO_CIGANA_ID);
    assert.equal(registro.rows[0]?.usuario_financeiro_id, USUARIO_FINANCEIRO_ID);

    candidatos = (await poolLeitura.query(`
            SELECT (
                SELECT identidade.usuario_id_externo
                  FROM financeiro.usuarios_financeiros AS usuario
                  INNER JOIN financeiro.identidades_externas AS identidade
                    ON identidade.usuario_financeiro_id = usuario.id
                   INNER JOIN financeiro.plataformas AS plataforma
                    ON plataforma.id = identidade.plataforma_id AND plataforma.ativo = TRUE
                 WHERE usuario.ativo = TRUE
                   AND identidade.ativo = TRUE
                   AND NOT EXISTS (
                       SELECT 1
                         FROM financeiro.usuario_papeis_financeiros AS usuario_papel
                         INNER JOIN financeiro.papeis_financeiros AS papel
                           ON papel.id = usuario_papel.papel_id AND papel.ativo = TRUE
                         INNER JOIN financeiro.papel_permissoes_financeiras AS papel_permissao
                           ON papel_permissao.papel_id = papel.id AND papel_permissao.ativo = TRUE
                         INNER JOIN financeiro.permissoes_financeiras AS permissao
                         ON permissao.id = papel_permissao.permissao_id AND permissao.ativo = TRUE
                        WHERE usuario_papel.usuario_financeiro_id = usuario.id
                          AND usuario_papel.ativo = TRUE
                          AND permissao.codigo = $1
                   )
                 LIMIT 1
            ) AS ativo_sem_permissao,
            (
                SELECT identidade.usuario_id_externo
                  FROM financeiro.identidades_externas AS identidade
                  INNER JOIN financeiro.plataformas AS plataforma
                    ON plataforma.id = identidade.plataforma_id AND plataforma.ativo = TRUE
                  INNER JOIN financeiro.usuarios_financeiros AS usuario
                    ON usuario.id = identidade.usuario_financeiro_id
                 WHERE usuario.ativo = FALSE
                   AND identidade.ativo = TRUE
                 LIMIT 1
            ) AS usuario_inativo
    `, [PERMISSAO_EXIGIDA])).rows[0];

    const semToken = await fetch(baseUrl);
    assert.equal(semToken.status, 401);

    const tokenInvalido = await fetch(baseUrl, {
        headers: { authorization: 'Bearer token-invalido' }
    });
    assert.equal(tokenInvalido.status, 401);

    const autorizado = await fetch(baseUrl, {
        headers: { authorization: `Bearer ${tokenAutorizado}` }
    });
    assert.equal(autorizado.status, 200);
    const resposta = await autorizado.json();
    assert.equal(resposta.data.usuario.id, USUARIO_CIGANA_ID);
    assert.equal(resposta.data.usuario.ativo, true);
    assert.ok(resposta.data.permissoes.includes(PERMISSAO_EXIGIDA));

    const uuidSemCadastro = 'bf03c86c-de36-4409-9305-ba8752edd3b2';
    const tokenSemCadastro = criarToken(
        uuidSemCadastro,
        parChaves.privateKey,
        kid,
        issuer,
        audience
    );
    const negado = await fetch(baseUrl, {
        headers: { authorization: `Bearer ${tokenSemCadastro}` }
    });
    assert.equal(negado.status, 403);

    await t.test('usuário ativo com identidade, mas sem permissão, recebe HTTP 403', async () => {
        const cliente = await poolAutorizacao.connect();
        const idInterno = randomUUID();
        const idExterno = randomUUID();
        await cliente.query('BEGIN');
        try {
            await cliente.query(
                'INSERT INTO financeiro.usuarios_financeiros (id) VALUES ($1)',
                [idInterno]
            );
            await cliente.query(`
                INSERT INTO financeiro.identidades_externas (
                    plataforma_id, usuario_financeiro_id, usuario_id_externo
                )
                SELECT id, $1, $2
                  FROM financeiro.plataformas
                 WHERE codigo = 'CIGANA'
            `, [idInterno, idExterno]);
            databasePool.definirPool({ query: (sql, parametros) => cliente.query(sql, parametros) });

            const token = criarToken(idExterno, parChaves.privateKey, kid, issuer, audience);
            const respostaSemPermissao = await fetch(baseUrl, {
                headers: { authorization: `Bearer ${token}` }
            });
            assert.equal(respostaSemPermissao.status, 403);
        } finally {
            await cliente.query('ROLLBACK');
            databasePool.definirPool(poolAutorizacao);
            cliente.release();
        }
    });

    await t.test('usuário financeiro inativo não resolve identidade', async () => {
        const cliente = await poolAutorizacao.connect();
        const idInterno = randomUUID();
        const idExterno = randomUUID();
        await cliente.query('BEGIN');
        try {
            await cliente.query(
                'INSERT INTO financeiro.usuarios_financeiros (id, ativo) VALUES ($1, FALSE)',
                [idInterno]
            );
            await cliente.query(`
                INSERT INTO financeiro.identidades_externas (
                    plataforma_id, usuario_financeiro_id, usuario_id_externo
                )
                SELECT id, $1, $2
                  FROM financeiro.plataformas
                 WHERE codigo = 'CIGANA'
            `, [idInterno, idExterno]);
            databasePool.definirPool({ query: (sql, parametros) => cliente.query(sql, parametros) });

            const token = criarToken(idExterno, parChaves.privateKey, kid, issuer, audience);
            const respostaUsuarioInativo = await fetch(baseUrl, {
                headers: { authorization: `Bearer ${token}` }
            });
            assert.equal(respostaUsuarioInativo.status, 403);
        } finally {
            await cliente.query('ROLLBACK');
            databasePool.definirPool(poolAutorizacao);
            cliente.release();
        }
    });

    await t.test('plataforma inativa rejeita uma identidade autenticada', async () => {
        const cliente = await poolAutorizacao.connect();
        await cliente.query('BEGIN');
        try {
            await cliente.query(`
                UPDATE financeiro.plataformas
                   SET ativo = FALSE
                 WHERE codigo = 'CIGANA'
            `);
            databasePool.definirPool({ query: (sql, parametros) => cliente.query(sql, parametros) });

            const respostaPlataformaInativa = await fetch(baseUrl, {
                headers: { authorization: `Bearer ${tokenAutorizado}` }
            });
            assert.equal(respostaPlataformaInativa.status, 403);
        } finally {
            await cliente.query('ROLLBACK');
            databasePool.definirPool(poolAutorizacao);
            cliente.release();
        }
    });

    await t.test('identidade externa inativa recebe HTTP 403', async () => {
        const cliente = await poolAutorizacao.connect();
        await cliente.query('BEGIN');
        try {
            await cliente.query(`
                UPDATE financeiro.identidades_externas
                   SET ativo = FALSE
                 WHERE usuario_financeiro_id = $1
                   AND usuario_id_externo = $2
            `, [USUARIO_FINANCEIRO_ID, USUARIO_CIGANA_ID]);
            databasePool.definirPool({ query: (sql, parametros) => cliente.query(sql, parametros) });

            const respostaIdentidadeInativa = await fetch(baseUrl, {
                headers: { authorization: `Bearer ${tokenAutorizado}` }
            });
            assert.equal(respostaIdentidadeInativa.status, 403);
        } finally {
            await cliente.query('ROLLBACK');
            databasePool.definirPool(poolAutorizacao);
            cliente.release();
        }
    });

    await t.test('UUID externo pode repetir em outra plataforma sem compartilhar usuário financeiro', async () => {
        const cliente = await poolAutorizacao.connect();
        const outroUsuarioFinanceiroId = randomUUID();
        const codigoOutraPlataforma = `TESTE_${randomUUID().replaceAll('-', '').toUpperCase()}`;
        const outroIssuer = `https://outra.integration.test/${randomUUID()}`;
        await cliente.query('BEGIN');
        try {
            await cliente.query(
                'INSERT INTO financeiro.plataformas (codigo, nome, issuer) VALUES ($1, $2, $3)',
                [codigoOutraPlataforma, 'Plataforma temporária de teste', outroIssuer]
            );
            await cliente.query(
                'INSERT INTO financeiro.usuarios_financeiros (id) VALUES ($1)',
                [outroUsuarioFinanceiroId]
            );
            await cliente.query(`
                INSERT INTO financeiro.identidades_externas (
                    plataforma_id, usuario_financeiro_id, usuario_id_externo
                )
                SELECT plataforma.id, $1, $2
                  FROM financeiro.plataformas AS plataforma
                 WHERE plataforma.codigo = $3
            `, [outroUsuarioFinanceiroId, USUARIO_CIGANA_ID, codigoOutraPlataforma]);

            const repetidos = await cliente.query(`
                SELECT count(DISTINCT plataforma.codigo)::integer AS plataformas,
                       count(DISTINCT identidade.usuario_financeiro_id)::integer AS usuarios_financeiros
                  FROM financeiro.identidades_externas AS identidade
                  INNER JOIN financeiro.plataformas AS plataforma
                    ON plataforma.id = identidade.plataforma_id
                 WHERE identidade.usuario_id_externo = $1
            `, [USUARIO_CIGANA_ID]);
            assert.equal(repetidos.rows[0].plataformas, 2);
            assert.equal(repetidos.rows[0].usuarios_financeiros, 2);

            await cliente.query('SAVEPOINT reassociacao');
            await assert.rejects(
                cliente.query(`
                    UPDATE financeiro.identidades_externas
                       SET usuario_financeiro_id = $1
                     WHERE plataforma_id = (
                         SELECT id FROM financeiro.plataformas WHERE codigo = 'CIGANA'
                     )
                       AND usuario_id_externo = $2
                `, [outroUsuarioFinanceiroId, USUARIO_CIGANA_ID]),
                /não pode ser reassociada/
            );
            await cliente.query('ROLLBACK TO SAVEPOINT reassociacao');
        } finally {
            await cliente.query('ROLLBACK');
            cliente.release();
        }
    });

    await t.test('usuário ativo sem a permissão exigida recebe HTTP 403', {
        skip: candidatos.ativo_sem_permissao ? false : 'não existe cadastro ativo sem essa permissão no banco atual'
    }, async () => {
        const tokenSemPermissao = criarToken(
            candidatos.ativo_sem_permissao,
            parChaves.privateKey,
            kid,
            issuer,
            audience
        );
        const respostaSemPermissao = await fetch(baseUrl, {
            headers: { authorization: `Bearer ${tokenSemPermissao}` }
        });
        assert.equal(respostaSemPermissao.status, 403);
    });

    await t.test('usuário financeiro inativo recebe HTTP 403', {
        skip: candidatos.usuario_inativo ? false : 'não existe cadastro financeiro inativo no banco atual'
    }, async () => {
        const tokenInativo = criarToken(
            candidatos.usuario_inativo,
            parChaves.privateKey,
            kid,
            issuer,
            audience
        );
        const respostaInativo = await fetch(baseUrl, {
            headers: { authorization: `Bearer ${tokenInativo}` }
        });
        assert.equal(respostaInativo.status, 403);
    });

    databasePool.definirPool({
        query: async () => { throw new Error('falha de banco simulada para teste'); }
    });
    const indisponivel = await fetch(baseUrl, {
        headers: { authorization: `Bearer ${tokenAutorizado}` }
    });
    assert.equal(indisponivel.status, 503);
    assert.equal((await indisponivel.json()).success, false);
});
