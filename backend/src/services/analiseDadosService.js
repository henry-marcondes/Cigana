const AnaliseProgressoLeitura = require('../models/AnaliseProgressoLeitura');
const AnaliseAvaliacoesComentarios = require('../models/AnaliseAvaliacoesComentarios');

class AnaliseDadosService {
    static async obterIndicadoresAvaliacoesComentarios({
        data_inicial,
        data_final,
        agrupamento
    }) {
        const [atuais, por_periodo] = await Promise.all([
            AnaliseAvaliacoesComentarios.obterIndicadoresAtuais(),
            AnaliseAvaliacoesComentarios.obterEvolucao({
                data_inicial,
                data_final,
                agrupamento
            })
        ]);

        return {
            atuais,
            evolucao: {
                data_inicial,
                data_final,
                agrupamento,
                fuso_horario: 'America/Sao_Paulo',
                por_periodo
            }
        };
    }

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
