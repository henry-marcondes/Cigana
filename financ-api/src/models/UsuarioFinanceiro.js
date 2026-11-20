const pool = require('../db/pool');

async function buscarSituacaoEPermissoes(usuarioFinanceiroId) {
    const resultado = await pool.obterPool().query(`
        SELECT usuario.ativo,
               COALESCE(
                   array_agg(DISTINCT permissao.codigo ORDER BY permissao.codigo)
                       FILTER (WHERE permissao.codigo IS NOT NULL),
                   ARRAY[]::varchar[]
               ) AS permissoes
          FROM financeiro.usuarios_financeiros AS usuario
          LEFT JOIN financeiro.usuario_papeis_financeiros AS usuario_papel
            ON usuario_papel.usuario_financeiro_id = usuario.id
           AND usuario_papel.ativo = TRUE
           AND usuario.ativo = TRUE
          LEFT JOIN financeiro.papeis_financeiros AS papel
            ON papel.id = usuario_papel.papel_id
           AND papel.ativo = TRUE
          LEFT JOIN financeiro.papel_permissoes_financeiras AS papel_permissao
            ON papel_permissao.papel_id = papel.id
           AND papel_permissao.ativo = TRUE
          LEFT JOIN financeiro.permissoes_financeiras AS permissao
            ON permissao.id = papel_permissao.permissao_id
           AND permissao.ativo = TRUE
         WHERE usuario.id = $1
         GROUP BY usuario.ativo
    `, [usuarioFinanceiroId]);

    return resultado.rows[0] || null;
}

module.exports = { buscarSituacaoEPermissoes };
