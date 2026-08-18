const Favorito = require('../models/Favorito');

class FavoritoService {

    static async listarPorUsuario(usuario_id) {
        return await Favorito.listarPorUsuario(usuario_id);
    }

    static async buscarPorId(id) {
        return await Favorito.buscarPorId(id);
    }

    static async buscarPorUsuarioELivro(usuario_id, livro_id) {
        return await Favorito.buscarPorUsuarioELivro(
            usuario_id,
            livro_id
        );
    }

    static async criar(favorito) {
        return await Favorito.criar(favorito);
    }

    static async desativar(id) {
        return await Favorito.desativar(id);
    }

}

module.exports = FavoritoService;
