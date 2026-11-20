const pool = require('../db/pool');

async function buscarIdentidadeAtiva(issuer, usuarioIdExterno) {
    const resultado = await pool.obterPool().query(`
        SELECT identidade.usuario_financeiro_id,
               plataforma.codigo AS plataforma_codigo
          FROM financeiro.identidades_externas AS identidade
          INNER JOIN financeiro.plataformas AS plataforma
            ON plataforma.id = identidade.plataforma_id
           AND plataforma.ativo = TRUE
          INNER JOIN financeiro.usuarios_financeiros AS usuario
            ON usuario.id = identidade.usuario_financeiro_id
           AND usuario.ativo = TRUE
         WHERE plataforma.issuer = $1
           AND identidade.usuario_id_externo = $2
           AND identidade.ativo = TRUE
         LIMIT 1
    `, [issuer, usuarioIdExterno]);

    return resultado.rows[0] || null;
}

module.exports = { buscarIdentidadeAtiva };
