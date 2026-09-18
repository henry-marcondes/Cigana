const Categoria = require('../models/Categoria');

class CategoriaService {

    static async listar() {
        return await Categoria.listar();
    }
    
    static async listarPorBiblioteca(bibliotecaSlug) {
        return await Categoria.listarPorBiblioteca(bibliotecaSlug);
    }

}

module.exports = CategoriaService;
