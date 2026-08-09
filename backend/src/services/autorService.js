const Autor = require('../models/Autor');

class AutorService {

    static async listarAutores() {
        return await Autor.listar();
    }

    static async buscarAutorPorId(id) {
        return await Autor.buscarPorId(id);
    }

    static async buscarAutorPorUsuarioId(usuario_id) {
        return await Autor.buscarPorUsuarioId(usuario_id);
    }

    static async criarAutor(autor) {
        return await Autor.criar(autor);
    }

    static async alterarNomePublico(id, nome_publico) {
        return await Autor.alterarNomePublico(id, nome_publico);
    }

    static async alterarBiografia(id, biografia) {
        return await Autor.alterarBiografia(id, biografia);
    }

    static async alterarFoto(id, foto_url) {
        return await Autor.alterarFoto(id, foto_url);
    }

    static async desativarAutor(id) {
        return await Autor.desativar(id);
    }
}

module.exports = AutorService;
