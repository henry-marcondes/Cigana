const Livro = require('../models/Livro');

class LivroService {

    static async listar() {
        return await Livro.listar();
    }

    static async buscarPorId(id) {
        return await Livro.buscarPorId(id);
    }

    static async buscarPorSlug(slug) {
        return await Livro.buscarPorSlug(slug);
    }

    static async criar(dados) {
        return await Livro.criar(dados);
    }

    static async alterarInformacoes(id, dados) {
        return await Livro.alterarInformacoes(id, dados);
    }

    static async alterarStatus(id, status_livro_id) {
        return await Livro.alterarStatus(id, status_livro_id);
    }

    static async alterarVisibilidade(id, visibilidade_livro_id) {
        return await Livro.alterarVisibilidade(
            id,
            visibilidade_livro_id
        );
    }

    static async alterarCapa(id, capa_url) {
        return await Livro.alterarCapa(id, capa_url);
    }

    static async desativar(id) {
        return await Livro.desativar(id);
    }
}

module.exports = LivroService;
