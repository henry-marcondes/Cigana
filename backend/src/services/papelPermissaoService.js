const PapelPermissao = require('../models/PapelPermissao');

class PapelPermissaoService {

    static async listarPorPapel(papelId) {
        return await PapelPermissao.listarPorPapel(papelId);
    }

    static async listarPorPermissao(permissaoId) {
        return await PapelPermissao.listarPorPermissao(permissaoId);
    }

    static async buscarPorId(id) {
        return await PapelPermissao.buscarPorId(id);
    }

    static async buscarPorPapelEPermissao(papelId, permissaoId) {
        return await PapelPermissao.buscarPorPapelEPermissao(
            papelId,
            permissaoId
        );
    }

    static async criar(papelId, permissaoId) {
        return await PapelPermissao.criar(
            papelId,
            permissaoId
        );
    }

    static async desativar(id) {
        return await PapelPermissao.desativar(id);
    }
}

module.exports = PapelPermissaoService;
