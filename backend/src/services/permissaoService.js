const Permissao = require('../models/Permissao');

class PermissaoService {

    static async listarPermissoes() {
        return await Permissao.listar();
    }

    static async buscarPermissaoPorId(id) {
        return await Permissao.buscarPorId(id);
    }

    static async buscarPermissaoPorCodigo(codigo) {
        return await Permissao.buscarPorCodigo(codigo);
    }

    static async criarPermissao(permissao) {
        return await Permissao.criar(permissao);
    }

    static async alterarNome(id, nome) {
        return await Permissao.alterarNome(id, nome);
    }

    static async alterarCodigo(id, codigo) {
        return await Permissao.alterarCodigo(id, codigo);
    }

    static async alterarDescricao(id, descricao) {
        return await Permissao.alterarDescricao(id, descricao);
    }

    static async desativarPermissao(id) {
        return await Permissao.desativar(id);
    }
}

module.exports = PermissaoService;
