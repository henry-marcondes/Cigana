const Favorito = require('../models/Favorito');

class FavoritoService {

    static async listar(usuario_id) {
        return Favorito.listarPorUsuario(usuario_id);
    }

    static async buscarPorLivro(usuario_id, livro_id) {
        return Favorito.buscarPorUsuarioELivro(
            usuario_id,
            livro_id
        );
    }

    static async criar(usuario_id, livro_id) {

        const existente = await Favorito.buscarIncluindoInativo(
            usuario_id,
            livro_id
        );

        // O favorito já está ativo.
        // Retorna o registro existente sem criar duplicidade.
        if (existente && existente.ativo) {
            return existente;
        }

        // O favorito existe, mas foi removido anteriormente.
        // Reativa o registro preservando seu histórico.
        if (existente && !existente.ativo) {
            return Favorito.reativar(existente.id);
        }

        // Não existe registro anterior.
        return Favorito.criar({
            usuario_id,
            livro_id
        });
    }

    static async removerPorLivro(usuario_id, livro_id) {
        return Favorito.removerPorUsuarioELivro(
            usuario_id,
            livro_id
        );
    }

}

module.exports = FavoritoService;
