const FinalLeitura = require('../models/FinalLeitura');

class FinalLeituraService {
    async listarPorUsuarioELivro(usuario_id, livro_id) {
        return FinalLeitura.listarPorUsuarioELivro(usuario_id, livro_id);
    }

    async registrar(usuario_id, livro_id, cena_id) {
        return FinalLeitura.registrar(usuario_id, livro_id, cena_id);
    }
}

module.exports = new FinalLeituraService();
