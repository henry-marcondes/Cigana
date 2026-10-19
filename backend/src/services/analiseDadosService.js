const AnaliseProgressoLeitura = require('../models/AnaliseProgressoLeitura');

class AnaliseDadosService {
    static async obterIndicadoresProgressoLeitura() {
        const [indicadores, categorias, obras, favoritos] = await Promise.all([
            AnaliseProgressoLeitura.obterIndicadores(),
            AnaliseProgressoLeitura.obterIndicadoresPorCategoria(),
            AnaliseProgressoLeitura.obterIndicadoresPorObra(),
            AnaliseProgressoLeitura.obterIndicadoresFavoritos()
        ]);

        return {
            ...indicadores,
            categorias,
            obras,
            favoritos
        };
    }
}

module.exports = AnaliseDadosService;
