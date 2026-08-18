const Avaliacao = require('../models/Avaliacao');

class AvaliacaoService {

    static async listarPorLivro(livro_id) {
        return await Avaliacao.listarPorLivro(livro_id);
    }

    static async listarPorUsuario(usuario_id) {
        return await Avaliacao.listarPorUsuario(usuario_id);
    }

    static async buscarPorId(id) {
        return await Avaliacao.buscarPorId(id);
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

    static async alterarNota(id, nota) {
        return await Avaliacao.alterarNota(id, nota);
    }

    static async alterarComentario(id, comentario) {
        return await Avaliacao.alterarComentario(id, comentario);
    }

    static async desativar(id) {
        return await Avaliacao.desativar(id);
    }

}

module.exports = AvaliacaoService;
