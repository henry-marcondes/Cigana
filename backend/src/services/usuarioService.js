const Usuario = require('../models/Usuario');

class UsuarioService {

    static async listarUsuarios() {
        return await Usuario.listar();
    }

    static async buscarUsuarioPorId(id) {
        return await Usuario.buscarPorId(id);
    }

    static async buscarUsuarioPorEmail(email) {
        return await Usuario.buscarPorEmail(email);
    }

    static async criarUsuario(usuario) {
        return await Usuario.criar(usuario);
    }

    static async atualizarUsuario(id, usuario) {
        return await Usuario.atualizar(id, usuario);
    }

    static async alterarSenha(id, novaSenhaHash) {
        return await Usuario.alterarSenha(id, novaSenhaHash);
    }

    static async desativarUsuario(id) {
        return await Usuario.desativar(id);
    }

}

module.exports = UsuarioService;
