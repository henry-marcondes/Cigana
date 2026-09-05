const pool = require('../db/connection');
const { error } = require('../utils/apiResponse');

function autorizar(codigoPermissao) {

    return async function (req, res, next) {

        if (!req.usuario || !req.usuario.id) {
            return error(
                res,
                'Usuário não autenticado.',
                401
            );
        }

        if (!codigoPermissao || typeof codigoPermissao !== 'string') {
            return error(
                res,
                'Permissão de autorização não informada.',
                500
            );
        }

        try {

            const result = await pool.query(`
                SELECT 1
                  FROM usuario_papeis up
                  INNER JOIN papeis p
                    ON p.id = up.papel_id
                   AND p.ativo = TRUE
                  INNER JOIN papel_permissoes pp
                    ON pp.papel_id = p.id
                   AND pp.ativo = TRUE
                  INNER JOIN permissoes pm
                    ON pm.id = pp.permissao_id
                   AND pm.ativo = TRUE
                 WHERE up.usuario_id = $1
                   AND up.ativo = TRUE
                   AND pm.codigo = $2
                 LIMIT 1
            `, [
                req.usuario.id,
                codigoPermissao
            ]);

            if (result.rowCount === 0) {
                return error(
                    res,
                    'Usuário não possui permissão para executar esta operação.',
                    403
                );
            }

            next();

        } catch (err) {

            next(err);
        }
    };
}

module.exports = autorizar;
