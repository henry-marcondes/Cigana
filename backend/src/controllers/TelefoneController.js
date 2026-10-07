const TelefoneService = require('../services/TelefoneService');
const { success, error } = require('../utils/apiResponse');

class TelefoneController {

    static async listarMeusTelefones(req, res) {
        try {
            const usuarioId = req.usuario.id;

            const telefones =
                await TelefoneService.listarMeusTelefones(usuarioId);

            return success(res, telefones);

        } catch (erro) {
            console.error('Erro ao listar telefones:', erro);

            if (erro.codigo === 'PESSOA_NAO_ENCONTRADA') {
                return error(
                    res,
                    'Cadastro de pessoa não encontrado.',
                    404
                );
            }

            return error(
                res,
                'Erro ao consultar telefones.'
            );
        }
    }

    static async buscarMeuTelefone(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { id } = req.params;

            const telefone =
                await TelefoneService.buscarMeuTelefone(
                    usuarioId,
                    id
                );

            return success(res, telefone);

        } catch (erro) {
            console.error('Erro ao buscar telefone:', erro);

            if (erro.codigo === 'PESSOA_NAO_ENCONTRADA') {
                return error(
                    res,
                    'Cadastro de pessoa não encontrado.',
                    404
                );
            }

            if (erro.codigo === 'TELEFONE_NAO_ENCONTRADO') {
                return error(
                    res,
                    'Telefone não encontrado.',
                    404
                );
            }

            return error(
                res,
                'Erro ao consultar telefone.'
            );
        }
    }

    static async criar(req, res) {
        try {
            const usuarioId = req.usuario.id;

            const telefone =
                await TelefoneService.criar(
                    usuarioId,
                    req.body
                );

            return success(
                res,
                telefone,
                'Telefone cadastrado com sucesso.',
                201
            );

        } catch (erro) {
            console.error('Erro ao criar telefone:', erro);

            if (erro.codigo === 'PESSOA_NAO_ENCONTRADA') {
                return error(
                    res,
                    'Cadastro de pessoa não encontrado.',
                    404
                );
            }

            if (erro.codigo === 'TELEFONE_JA_CADASTRADO') {
                return error(
                    res,
                    'Este número de telefone já está cadastrado para esta pessoa.',
                    409
                );
            }

            return error(
                res,
                'Erro ao cadastrar telefone.'
            );
        }
    }

    static async atualizar(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { id } = req.params;

            const telefone =
                await TelefoneService.atualizar(
                    usuarioId,
                    id,
                    req.body
                );

            return success(
                res,
                telefone,
                'Telefone atualizado com sucesso.'
            );

        } catch (erro) {
            console.error('Erro ao atualizar telefone:', erro);

            if (erro.codigo === 'PESSOA_NAO_ENCONTRADA') {
                return error(
                    res,
                    'Cadastro de pessoa não encontrado.',
                    404
                );
            }

            if (erro.codigo === 'TELEFONE_NAO_ENCONTRADO') {
                return error(
                    res,
                    'Telefone não encontrado.',
                    404
                );
            }

            if (erro.codigo === 'TELEFONE_JA_CADASTRADO') {
                return error(
                    res,
                    'Este número de telefone já está cadastrado para esta pessoa.',
                    409
                );
            }

            return error(
                res,
                'Erro ao atualizar telefone.'
            );
        }
    }

    static async definirPrincipal(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { id } = req.params;

            const telefone =
                await TelefoneService.definirPrincipal(
                    usuarioId,
                    id
                );

            return success(
                res,
                telefone,
                'Telefone definido como principal.'
            );

        } catch (erro) {
            console.error(
                'Erro ao definir telefone principal:',
                erro
            );

            if (erro.codigo === 'PESSOA_NAO_ENCONTRADA') {
                return error(
                    res,
                    'Cadastro de pessoa não encontrado.',
                    404
                );
            }

            if (erro.codigo === 'TELEFONE_NAO_ENCONTRADO') {
                return error(
                    res,
                    'Telefone não encontrado.',
                    404
                );
            }

            return error(
                res,
                'Erro ao definir telefone principal.'
            );
        }
    }

    static async desativar(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { id } = req.params;

            const telefone =
                await TelefoneService.desativar(
                    usuarioId,
                    id
                );

            return success(
                res,
                telefone,
                'Telefone desativado com sucesso.'
            );

        } catch (erro) {
            console.error('Erro ao desativar telefone:', erro);

            if (erro.codigo === 'PESSOA_NAO_ENCONTRADA') {
                return error(
                    res,
                    'Cadastro de pessoa não encontrado.',
                    404
                );
            }

            if (erro.codigo === 'TELEFONE_NAO_ENCONTRADO') {
                return error(
                    res,
                    'Telefone não encontrado.',
                    404
                );
            }

            return error(
                res,
                'Erro ao desativar telefone.'
            );
        }
    }
}

module.exports = TelefoneController;
