const Idioma = require('../models/Idioma');

class IdiomaService {

    static async listar() {
        return await Idioma.listar();
    }

}

module.exports = IdiomaService;
