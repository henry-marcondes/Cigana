const UsuarioPapel = require('../models/UsuarioPapel');

class UsuarioPapelService {

    static async listarPorUsuario(usuarioId) {
        return await UsuarioPapel.listarPorUsuario(usuarioId);
    }

    static async listarPorPapel(papelId) {
        return await UsuarioPapel.listarPorPapel(papelId);
    }

    static async buscarPorId(id) {
        return await UsuarioPapel.buscarPorId(id);
    }

    static async buscarPorUsuarioEPapel(usuarioId, papelId) {
        return await UsuarioPapel.buscarPorUsuarioEPapel(
            usuarioId,
            papelId
        );
    }

    static async criar(usuarioId, papelId) {
        return await UsuarioPapel.criar(
            usuarioId,
            papelId
        );
    }

    static async desativar(id) {
        return await UsuarioPapel.desativar(id);
    }
}

module.exports = UsuarioPapelService;
