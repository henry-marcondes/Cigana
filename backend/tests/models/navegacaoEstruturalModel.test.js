const assert = require('node:assert/strict');
const pool = require('../../src/db/connection');
const Livro = require('../../src/models/Livro');
const Capitulo = require('../../src/models/Capitulo');
const Cena = require('../../src/models/Cena');
const NavegacaoEstrutural = require('../../src/models/NavegacaoEstrutural');

async function executarTestes() {
    const client = await pool.connect();
    const sufixo = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
        await client.query('BEGIN');

        const [categoria, classificacao, idioma, status, visibilidade] = await Promise.all([
            client.query('SELECT id FROM categorias LIMIT 1'),
            client.query('SELECT id FROM classificacoes_indicativas LIMIT 1'),
            client.query('SELECT id FROM idiomas LIMIT 1'),
            client.query('SELECT id FROM status_livro LIMIT 1'),
            client.query('SELECT id FROM visibilidade_livro LIMIT 1'),
        ]);
        assert.ok(categoria.rows[0] && classificacao.rows[0] && idioma.rows[0] && status.rows[0] && visibilidade.rows[0], 'O banco de teste precisa dos registros de referência existentes.');

        const livro = await Livro.criar({
            categoria_id: categoria.rows[0].id,
            classificacao_indicativa_id: classificacao.rows[0].id,
            idioma_id: idioma.rows[0].id,
            status_livro_id: status.rows[0].id,
            visibilidade_livro_id: visibilidade.rows[0].id,
            titulo: 'Livro de teste de navegação estrutural',
            slug: `teste-navegacao-${sufixo}`,
            resumo: 'Registro temporário para teste.',
            isbn: null,
            ano_publicacao: 2026,
            data_publicacao: new Date(),
            ordem_exibicao: 1,
        }, client);
        const capitulo = await Capitulo.criar({
            livro_id: livro.id,
            titulo: 'Capítulo de teste',
            slug: `capitulo-teste-${sufixo}`,
            ordem_exibicao: 1,
        }, client);
        const cenas = await Promise.all([1, 2, 3].map((numero) => Cena.criar({
            capitulo_id: capitulo.id,
            titulo: `Cena ${numero}`,
            slug: `cena-${numero}-${sufixo}`,
            texto: '',
            ordem_exibicao: numero,
            cena_inicial: numero === 1,
        }, client)));

        const primeiro = await NavegacaoEstrutural.criar({
            cena_origem_id: cenas[0].id,
            cena_destino_id: cenas[1].id,
            rotulo: 'Continuar',
            ordem_exibicao: 1,
        }, client);
        const segundo = await NavegacaoEstrutural.criar({
            cena_origem_id: cenas[0].id,
            cena_destino_id: cenas[2].id,
            rotulo: 'Pular para o fim',
            ordem_exibicao: 2,
        }, client);

        const reordenadas = await NavegacaoEstrutural.reordenar(
            cenas[0].id,
            [{ id: segundo.id }, { id: primeiro.id }],
            client
        );
        assert.deepEqual(reordenadas.map((item) => item.id), [segundo.id, primeiro.id]);
        assert.deepEqual(reordenadas.map((item) => Number(item.ordem_exibicao)), [1, 2]);

        const alterada = await NavegacaoEstrutural.alterar(primeiro.id, {
            cena_destino_id: cenas[2].id,
            rotulo: 'Ir ao final',
        }, client);
        assert.equal(alterada.rotulo, 'Ir ao final');
        assert.equal(alterada.cena_destino_id, cenas[2].id);

        await NavegacaoEstrutural.desativar(primeiro.id, client);
        const ativas = await NavegacaoEstrutural.listarPorCenaOrigem(cenas[0].id, client);
        assert.deepEqual(ativas.map((item) => item.id), [segundo.id]);

        console.log('Modelo NavegacaoEstrutural: CRUD lógico e reordenação sem colisões validados.');
    } catch (error) {
        console.error('Falha nos testes de NavegacaoEstrutural:', error);
        process.exitCode = 1;
    } finally {
        await client.query('ROLLBACK');
        client.release();
        await pool.end();
    }
}

executarTestes();
