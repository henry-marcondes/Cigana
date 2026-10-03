const Usuario = require('../models/Usuario');
const Preferencia = require('../models/Preferencia');
const UsuarioPreferencia = require('../models/UsuarioPreferencia');

class UsuarioPreferenciaService {

    static async listarPorUsuario(usuarioId) {
        const usuario = await Usuario.buscarPorId(usuarioId);

        if (!usuario) {
            const erro = new Error('Usuário não encontrado');
            erro.statusCode = 404;
            erro.codigo = 'USUARIO_NAO_ENCONTRADO';
            throw erro;
        }

        return await UsuarioPreferencia.listarPorUsuario(usuarioId);
    }

    static async buscarPorId(id, usuarioId) {
        const usuarioPreferencia = await UsuarioPreferencia.buscarPorId(id, usuarioId);

        if (!usuarioPreferencia) {
            const erro = new Error('Preferência do usuário não encontrada');
            erro.statusCode = 404;
            erro.codigo = 'USUARIO_PREFERENCIA_NAO_ENCONTRADA';
            throw erro;
        }

        return usuarioPreferencia;
    }

    static async adicionar(usuarioId, preferenciaId) {
        const usuario = await Usuario.buscarPorId(usuarioId);

        if (!usuario) {
            const erro = new Error('Usuário não encontrado');
            erro.statusCode = 404;
            erro.codigo = 'USUARIO_NAO_ENCONTRADO';
            throw erro;
        }

        const preferencia = await Preferencia.buscarPorId(preferenciaId);

        if (!preferencia) {
            const erro = new Error('Preferência não encontrada');
            erro.statusCode = 404;
            erro.codigo = 'PREFERENCIA_NAO_ENCONTRADA';
            throw erro;
        }

        const preferencias = await UsuarioPreferencia.listarPorUsuario(usuarioId);

        const existente = preferencias.find(
            item => item.preferencia_id === preferenciaId
        );

        if (existente) {
            const erro = new Error('Preferência já está associada ao usuário');
            erro.statusCode = 409;
            erro.codigo = 'USUARIO_PREFERENCIA_JA_EXISTE';
            throw erro;
        }

        return await UsuarioPreferencia.adicionar(
            usuarioId,
            preferenciaId
        );
    }

    static async remover(id, usuarioId) {
        const usuarioPreferencia =
            await UsuarioPreferencia.buscarPorId(id, usuarioId);

        if (!usuarioPreferencia) {
            const erro = new Error(
                'Preferência do usuário não encontrada'
            );
            erro.statusCode = 404;
            erro.codigo = 'USUARIO_PREFERENCIA_NAO_ENCONTRADA';
            throw erro;
        }

        return await UsuarioPreferencia.remover(
            id, usuarioId );
    }

}

module.exports = UsuarioPreferenciaService;
