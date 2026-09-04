const StatusLivro = require('../models/StatusLivro');

class StatusLivroService {

    static async listar() {
        return await StatusLivro.listar();
    }

}

module.exports = StatusLivroService;
