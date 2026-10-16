const Avaliacao = require('../models/Avaliacao');

class AvaliacaoService {

    static async listarPorLivro(livro_id) {
        return await Avaliacao.listarPorLivro(livro_id);
    }

    static async listarPorUsuario(usuario_id) {
        return await Avaliacao.listarPorUsuario(usuario_id);
    }

    static async buscarPorId(id, usuario_id) {
        return await Avaliacao.buscarPorId(id, usuario_id);
    }

    static async buscarPorUsuarioELivro(usuario_id, livro_id) {
        return await Avaliacao.buscarPorUsuarioELivro(
            usuario_id,
            livro_id
        );
    }

    static async criar(avaliacao) {
        return await Avaliacao.criar(avaliacao);
    }

    static async alterarNota(id, usuario_id, nota) {
        return await Avaliacao.alterarNota(id, usuario_id, nota);
    }

    static async alterarComentario(id, usuario_id, comentario) {
        return await Avaliacao.alterarComentario(id, usuario_id, comentario);
    }

    static async desativar(id, usuario_id) {
        return await Avaliacao.desativar(id, usuario_id);
    }

}

module.exports = AvaliacaoService;
