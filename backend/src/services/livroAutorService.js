const LivroAutor = require('../models/LivroAutor');

class LivroAutorService {

    static async listarPorLivro(livro_id) {
        return await LivroAutor.listarPorLivro(livro_id);
    }

    static async listarPorAutor(autor_id) {
        return await LivroAutor.listarPorAutor(autor_id);
    }

    static async criarLivroAutor(livroAutor) {
        return await LivroAutor.criar(livroAutor);
    }

    static async alterarOrdemExibicao(id, ordem_exibicao) {
        return await LivroAutor.alterarOrdemExibicao(
            id,
            ordem_exibicao
        );
    }

    static async desativarLivroAutor(id) {
        return await LivroAutor.desativar(id);
    }

}

module.exports = LivroAutorService;
