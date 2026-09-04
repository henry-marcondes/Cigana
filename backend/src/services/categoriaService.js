const Categoria = require('../models/Categoria');

class CategoriaService {

    static async listar() {
        return await Categoria.listar();
    }

}

module.exports = CategoriaService;
