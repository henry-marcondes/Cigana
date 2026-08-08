const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

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
        const usuarioExixtente = await Usuario.buscarPorEmail(usuario.email);
        if(usuarioExixtente){
        throw new Error('EMAIL_JA_CADASTRADO');
        }
        const senhaHash = await bcrypt.hash(usuario.senha, 10);
        return await Usuario.criar({
            email: usuario.email,
            senha_hash: senhaHash 
        });
    }

    static async atualizarUsuario(id, usuario) {
        const usuarioAtual = await Usuario.buscarPorId(id);
        if (!usuarioAtual) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }
        const usuarioComMesmoEmail = await Usuario.buscarPorEmail(usuario.email);

        if (
            usuarioComMesmoEmail &&
            usuarioComMesmoEmail.id !== id
        ) {
        throw new Error('EMAIL_JA_CADASTRADO');
        }
        return await Usuario.atualizar(id, {
        email: usuario.email
        });
    }

    static async alterarSenhaUsuario(id, novaSenha) {
        const usuario = await Usuario.buscarPorId(id);
        if (!usuario) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        return await Usuario.alterarSenha(id, novaSenhaHash );

    }

    static async desativarUsuario(id) {
        const usuario = await Usuario.buscarPorId(id);
        if (!usuario) { throw new Error('USUARIO_NAO_ENCONTRADO');}

        return await Usuario.desativar(id);
    }
}

module.exports = UsuarioService;
