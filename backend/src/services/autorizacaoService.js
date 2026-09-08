const LivroAutor = require('../models/LivroAutor');

class AutorizacaoService {

    static async temPermissao(usuario_id, codigoPermissao) {
        const pool = require('../db/connection');

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
        `, [usuario_id, codigoPermissao]);

        return result.rowCount > 0;
    }

    static async podeEditarObra(usuario_id, livro_id) {
        const possuiPermissao = await this.temPermissao(
            usuario_id,
            'obra.editar'
        );

        if (possuiPermissao) {
            return true;
        }

        return LivroAutor.usuarioEhAutorDaObra(
            usuario_id,
            livro_id
        );
    }
}

module.exports = AutorizacaoService;
