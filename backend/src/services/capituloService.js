const Capitulo = require('../models/Capitulo');

class CapituloService {

    static async listarPorLivro(livro_id) {
        return await Capitulo.listarPorLivro(livro_id);
    }

    static async buscarPorId(id) {
        return await Capitulo.buscarPorId(id);
    }

    static async buscarPorSlug(livro_id, slug) {
        return await Capitulo.buscarPorSlug(livro_id, slug);
    }

    static async criar(capitulo) {
        return await Capitulo.criar(capitulo);
    }

    static async alterarInformacoes(id, capitulo) {
        return await Capitulo.alterarInformacoes(id, capitulo);
    }

    static async alterarCapa(id, capa_url) {
        return await Capitulo.alterarCapa(id, capa_url);
    }

    static async desativar(id) {
        return await Capitulo.desativar(id);
    }
}

module.exports = CapituloService;
