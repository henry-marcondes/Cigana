const VisibilidadeLivro = require('../models/VisibilidadeLivro');

class VisibilidadeLivroService {

    static async listar() {
        return await VisibilidadeLivro.listar();
    }

}

module.exports = VisibilidadeLivroService;
