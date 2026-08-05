const UsuarioService = require('../services/usuarioService');

class UsuarioController {

    static async listar(req, res) {

        try {

            const usuarios = await UsuarioService.listarUsuarios();

            return res.status(200).json(usuarios);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                erro: 'Erro interno do servidor'
            });
        }
    }

}

module.exports = UsuarioController;
