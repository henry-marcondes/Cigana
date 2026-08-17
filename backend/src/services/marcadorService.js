const Marcador = require('../models/Marcador');

class MarcadorService {

    static async listarPorUsuario(usuario_id) {
        return await Marcador.listarPorUsuario(usuario_id);
    }

    static async listarPorLivro(usuario_id, livro_id) {
        return await Marcador.listarPorLivro(usuario_id, livro_id);
    }

    static async buscarPorId(id) {
        return await Marcador.buscarPorId(id);
    }

    static async criar(marcador) {
        return await Marcador.criar(marcador);
    }

    static async alterarInformacoes(id, marcador) {
        return await Marcador.alterarInformacoes(id, marcador);
    }

    static async alterarCena(id, cena_id) {
        return await Marcador.alterarCena(id, cena_id);
    }

    static async desativar(id) {
        return await Marcador.desativar(id);
    }
}

module.exports = MarcadorService;
