const Comentario = require('../models/Comentario');

class ComentarioService {

    static async listarPorLivro(livro_id) {
        return await Comentario.listarPorLivro(livro_id);
    }

    static async listarPorUsuario(usuario_id) {
        return await Comentario.listarPorUsuario(usuario_id);
    }

    static async buscarPorId(id) {
        return await Comentario.buscarPorId(id);
    }

    static async criar(comentario) {
        return await Comentario.criar(comentario);
    }

    static async alterarTexto(id, texto) {
        return await Comentario.alterarTexto(id, texto);
    }

    static async desativar(id) {
        return await Comentario.desativar(id);
    }

}

module.exports = ComentarioService;
