const PessoaService = require('../services/PessoaService');
const apiResponse = require('../utils/apiResponse');

class PessoaController {

    static async buscarMinhaPessoa(req, res) {
        try {
            const usuarioId = req.usuario.id;

            const pessoa = await PessoaService.buscarMinhaPessoa(usuarioId);

            return apiResponse.success(res, pessoa);

        } catch (error) {
            console.error('Erro ao buscar pessoa:', error);

            return apiResponse.error(
                res,
                'Erro ao consultar cadastro de pessoa.'
            );
        }
    }

    static async criar(req, res) {
        try {
            const usuarioId = req.usuario.id;

            const pessoa = await PessoaService.criar(
                usuarioId,
                req.body
            );

            return apiResponse.success(
                res,
                pessoa,
                null,
                201
            );
        } catch (error) {
            console.error('Erro ao criar pessoa:', error);

            if (error.codigo === 'PESSOA_JA_CADASTRADA') {
                return apiResponse.error(
                    res,
                    'Já existe um cadastro de pessoa para este usuário.',
                    409
                );
            }

            if (error.codigo === 'TIPO_PESSOA_INVALIDO') {
                return apiResponse.error(
                    res,
                    'Tipo de pessoa inválido.',
                    400
                );
            }

            return apiResponse.error(
                res,
                'Erro ao criar cadastro de pessoa.'
            );
        }
    }

    static async atualizar(req, res) {
        try {
            const usuarioId = req.usuario.id;

            const pessoa = await PessoaService.atualizar(
                usuarioId,
                req.body
            );

            return apiResponse.success(
                res,
                pessoa
            );

        } catch (error) {
            console.error('Erro ao atualizar pessoa:', error);

            if (error.codigo === 'PESSOA_NAO_ENCONTRADA') {
                return apiResponse.error(
                    res,
                    'Cadastro de pessoa não encontrado.',
                    404
                );
            }

            if (error.codigo === 'TIPO_PESSOA_NAO_PODE_SER_ALTERADO') {
                return apiResponse.error(
                    res,
                    'O tipo de pessoa não pode ser alterado após o cadastro.',
                    400
                );
            }

            if (error.codigo === 'PESSOA_FISICA_NAO_ENCONTRADA') {
                return apiResponse.error(
                    res,
                    'Cadastro de pessoa física não encontrado.',
                    404
                );
            }

            if (error.codigo === 'PESSOA_JURIDICA_NAO_ENCONTRADA') {
                return apiResponse.error(
                    res,
                    'Cadastro de pessoa jurídica não encontrado.',
                    404
                );
            }

            if (error.codigo === 'TIPO_PESSOA_INVALIDO') {
                return apiResponse.error(
                    res,
                    'Tipo de pessoa inválido.',
                    400
                );
            }

            return apiResponse.error(
                res,
                'Erro ao atualizar cadastro de pessoa.'
            );
        }
    }
}

module.exports = PessoaController;
