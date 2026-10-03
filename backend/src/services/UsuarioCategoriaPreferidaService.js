const Usuario = require('../models/Usuario');
const Categoria = require('../models/Categoria');
const UsuarioCategoriaPreferida = require('../models/UsuarioCategoriaPreferida');

class UsuarioCategoriaPreferidaService {

    static async listarPorUsuario(usuarioId) {
        const usuario = await Usuario.buscarPorId(usuarioId);

        if (!usuario) {
            const erro = new Error('Usuário não encontrado');
            erro.statusCode = 404;
            erro.codigo = 'USUARIO_NAO_ENCONTRADO';
            throw erro;
        }

        return await UsuarioCategoriaPreferida.listarPorUsuario(usuarioId);
    }

    static async buscarPorId(id, usuarioId) {
        const categoriaPreferida =
            await UsuarioCategoriaPreferida.buscarPorId(
                id,
                usuarioId
            );

        if (!categoriaPreferida) {
            const erro = new Error(
                'Categoria preferida do usuário não encontrada'
            );
            erro.statusCode = 404;
            erro.codigo =
                'USUARIO_CATEGORIA_PREFERIDA_NAO_ENCONTRADA';

            throw erro;
        }

        return categoriaPreferida;
    }

    static async adicionar(usuarioId, categoriaId) {
        const usuario = await Usuario.buscarPorId(usuarioId);

        if (!usuario) {
            const erro = new Error('Usuário não encontrado');
            erro.statusCode = 404;
            erro.codigo = 'USUARIO_NAO_ENCONTRADO';
            throw erro;
        }

        const categoria = await Categoria.buscarPorId(categoriaId);

        if (!categoria) {
            const erro = new Error('Categoria não encontrada');
            erro.statusCode = 404;
            erro.codigo = 'CATEGORIA_NAO_ENCONTRADA';
            throw erro;
        }

        const categorias =
            await UsuarioCategoriaPreferida.listarPorUsuario(usuarioId);

        const existente = categorias.find(
            item => item.categoria_id === categoriaId
        );

        if (existente) {
            const erro = new Error(
                'Categoria já está associada às preferências do usuário'
            );
            erro.statusCode = 409;
            erro.codigo = 'USUARIO_CATEGORIA_PREFERIDA_JA_EXISTE';
            throw erro;
        }

        return await UsuarioCategoriaPreferida.adicionar(
            usuarioId,
            categoriaId
        );
    }

    static async remover(id, usuarioId) {
        const categoriaPreferida =
            await UsuarioCategoriaPreferida.buscarPorId(
                id,
                usuarioId
            );

        if (!categoriaPreferida) {
            const erro = new Error(
                'Categoria preferida do usuário não encontrada'
            );
            erro.statusCode = 404;
            erro.codigo =
                'USUARIO_CATEGORIA_PREFERIDA_NAO_ENCONTRADA';

            throw erro;
        }

        return await UsuarioCategoriaPreferida.remover(
            id, usuarioId );
    }
}

module.exports = UsuarioCategoriaPreferidaService;
