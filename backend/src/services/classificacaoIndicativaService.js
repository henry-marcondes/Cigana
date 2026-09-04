const ClassificacaoIndicativa = require('../models/ClassificacaoIndicativa');

class ClassificacaoIndicativaService {

    static async listar() {
        return await ClassificacaoIndicativa.listar();
    }

}

module.exports = ClassificacaoIndicativaService;
