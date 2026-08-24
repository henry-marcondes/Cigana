const Usuario = require('../models/Usuario');
const { TokenUsuarioService } = require('./tokenUsuarioService');
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

    static async solicitarVerificacaoEmail(id) {
        const usuario = await Usuario.buscarPorId(id);

        if (!usuario) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        if (usuario.email_verificado_em) {
            throw new Error('EMAIL_JA_VERIFICADO');
        }

        return await TokenUsuarioService.criar({
            usuario_id: id,
            finalidade: 'VERIFICACAO_EMAIL'
        });
    }

    static async verificarEmail(id, token) {
        const usuario = await Usuario.buscarPorId(id);

        if (!usuario) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        if (usuario.email_verificado_em) {
            throw new Error('EMAIL_JA_VERIFICADO');
        }

        await TokenUsuarioService.validar({
            usuario_id: id,
            finalidade: 'VERIFICACAO_EMAIL',
            token
        });

        const usuarioAtualizado = await Usuario.verificarEmail(id);

        if (!usuarioAtualizado) {
            throw new Error('NAO_FOI_POSSIVEL_VERIFICAR_EMAIL');
        }

        return usuarioAtualizado;
    }
    
    static async solicitarAlteracaoSenha(id, senha) {
    const usuario = await Usuario.buscarCredenciaisPorId(id);

    if (!usuario) {
        throw new Error('USUARIO_NAO_ENCONTRADO');
    }

    if (!usuario.email_verificado_em) {
        throw new Error('EMAIL_NAO_VERIFICADO');
    }

    const senhaCorreta = await bcrypt.compare(
        senha,
        usuario.senha_hash
    );

    if (!senhaCorreta) {
        throw new Error('SENHA_ATUAL_INCORRETA');
    }

    return await TokenUsuarioService.criar({
        usuario_id: id,
        finalidade: 'ALTERACAO_SENHA'
    });
}
    static async alterarSenhaComToken(id, token, novaSenha) {
    const usuario = await Usuario.buscarPorId(id);

    if (!usuario) {
        throw new Error('USUARIO_NAO_ENCONTRADO');
    }

    if (!usuario.email_verificado_em) {
        throw new Error('EMAIL_NAO_VERIFICADO');
    }

    await TokenUsuarioService.validar({
        usuario_id: id,
        finalidade: 'ALTERACAO_SENHA',
        token
    });

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    const usuarioAtualizado = await Usuario.alterarSenha(
        id,
        novaSenhaHash
    );

    if (!usuarioAtualizado) {
        throw new Error('NAO_FOI_POSSIVEL_ALTERAR_SENHA');
    }

    return usuarioAtualizado;
}

    static async solicitarRecuperacaoSenha(email) {
    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
        return {
            solicitado: true
        };
    }

    return await TokenUsuarioService.criar({
        usuario_id: usuario.id,
        finalidade: 'RECUPERACAO_SENHA'
    });
}

    static async recuperarSenhaComToken(email, token, novaSenha) {
    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
        throw new Error('TOKEN_INVALIDO');
    }

    await TokenUsuarioService.validar({
        usuario_id: usuario.id,
        finalidade: 'RECUPERACAO_SENHA',
        token
    });

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    const usuarioAtualizado = await Usuario.alterarSenha(
        usuario.id,
        novaSenhaHash
    );

    if (!usuarioAtualizado) {
        throw new Error('NAO_FOI_POSSIVEL_ALTERAR_SENHA');
    }

    return usuarioAtualizado;
}

    static async autenticarUsuario(email, senha) {

    const usuario = await Usuario.buscarCredenciaisPorEmail(email);

    if (!usuario) {
        throw new Error('CREDENCIAIS_INVALIDAS');
    }

    const senhaCorreta = await bcrypt.compare(
        senha,
        usuario.senha_hash
    );

    if (!senhaCorreta) {
        throw new Error('CREDENCIAIS_INVALIDAS');
    }

    if (!usuario.email_verificado_em) {
        throw new Error('EMAIL_NAO_VERIFICADO');
    }

    const usuarioAtualizado = await Usuario.registrarLogin(
        usuario.id
    );

    if (!usuarioAtualizado) {
        throw new Error('NAO_FOI_POSSIVEL_REGISTRAR_LOGIN');
    }

    return usuarioAtualizado;
}

    static async desativarUsuario(id) {
        const usuario = await Usuario.buscarPorId(id);
        if (!usuario) { throw new Error('USUARIO_NAO_ENCONTRADO');}

        return await Usuario.desativar(id);
    }
}

module.exports = UsuarioService;
