const Preferencia = require('../models/Preferencia');

class PreferenciaService {

    static async listar() {
        return await Preferencia.listar();
    }

    static async listarPorGrupo(grupo) {
        return await Preferencia.listarPorGrupo(grupo);
    }

    static async buscarPorCodigo(grupo, codigo) {
        const preferencia = await Preferencia.buscarPorCodigo(grupo, codigo);

        if (!preferencia) {
            const erro = new Error('Preferência não encontrada');
            erro.statusCode = 404;
            erro.codigo = 'PREFERENCIA_NAO_ENCONTRADA';
            throw erro;
        }

        return preferencia;
    }


    static async criar(dados) {
        const {
            grupo,
            codigo,
            nome,
            descricao,
            ordem_exibicao
        } = dados;

        const existente = await Preferencia.buscarPorCodigo(grupo, codigo);

        if (existente) {
            const erro = new Error('Já existe uma preferência com este código no grupo informado');
            erro.statusCode = 409;
            erro.codigo = 'PREFERENCIA_JA_EXISTE';
            throw erro;
        }

        return await Preferencia.criar({
            grupo,
            codigo,
            nome,
            descricao,
            ordem_exibicao
        });
    }
}

module.exports = PreferenciaService;
