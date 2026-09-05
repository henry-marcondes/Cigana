const Papel = require('../models/Papel');

class PapelService {

    static async listarPapeis() {
        return await Papel.listar();
    }

    static async buscarPapelPorId(id) {
        return await Papel.buscarPorId(id);
    }

    static async buscarPapelPorCodigo(codigo) {
        return await Papel.buscarPorCodigo(codigo);
    }

    static async criarPapel(papel) {
        return await Papel.criar(papel);
    }

    static async alterarNome(id, nome) {
        return await Papel.alterarNome(id, nome);
    }

    static async alterarCodigo(id, codigo) {
        return await Papel.alterarCodigo(id, codigo);
    }

    static async alterarDescricao(id, descricao) {
        return await Papel.alterarDescricao(id, descricao);
    }

    static async desativarPapel(id) {
        return await Papel.desativar(id);
    }
}

module.exports = PapelService;
