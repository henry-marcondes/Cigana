const pool = require('../db/pool');

async function listarCodigosEfetivosPorUsuario(usuarioIdExterno) {
    const resultado = await pool.obterPool().query(`
        SELECT DISTINCT permissao.codigo
          FROM financeiro.usuarios_financeiros AS usuario
          INNER JOIN financeiro.usuario_papeis_financeiros AS usuario_papel
            ON usuario_papel.usuario_id_externo = usuario.usuario_id_externo
           AND usuario_papel.ativo = TRUE
          INNER JOIN financeiro.papeis_financeiros AS papel
            ON papel.id = usuario_papel.papel_id
           AND papel.ativo = TRUE
          INNER JOIN financeiro.papel_permissoes_financeiras AS papel_permissao
            ON papel_permissao.papel_id = papel.id
           AND papel_permissao.ativo = TRUE
          INNER JOIN financeiro.permissoes_financeiras AS permissao
            ON permissao.id = papel_permissao.permissao_id
           AND permissao.ativo = TRUE
         WHERE usuario.usuario_id_externo = $1
           AND usuario.ativo = TRUE
         ORDER BY permissao.codigo
    `, [usuarioIdExterno]);

    return resultado.rows.map((linha) => linha.codigo);
}

module.exports = { listarCodigosEfetivosPorUsuario };
