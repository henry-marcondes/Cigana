const EnderecoService = require('../services/EnderecoService');
const { success, error } = require('../utils/apiResponse');

class EnderecoController {

    static async listarMeusEnderecos(req, res) {
        try {
            const enderecos =
                await EnderecoService.listarMeusEnderecos(
                    req.usuario.id
                );

            return success(
                res,
                enderecos,
                'Endereços listados com sucesso.'
            );

        } catch (err) {
            console.error('Erro ao listar endereços:', err);

            return error(
                res,
                err.message,
                err.codigo
            );
        }
    }

    static async buscarMeuEndereco(req, res) {
        try {
            const endereco =
                await EnderecoService.buscarMeuEndereco(
                    req.usuario.id,
                    req.params.id
                );

            return success(
                res,
                endereco,
                'Endereço encontrado com sucesso.'
            );

        } catch (err) {
            console.error('Erro ao buscar endereço:', err);

            return error(
                res,
                err.message,
                err.codigo
            );
        }
    }

    static async criar(req, res) {
        try {
            const endereco =
                await EnderecoService.criar(
                    req.usuario.id,
                    req.body
                );

            return success(
                res,
                endereco,
                'Endereço cadastrado com sucesso.',
                201
            );

        } catch (err) {
            console.error('Erro ao criar endereço:', err);

            return error(
                res,
                err.message,
                err.codigo
            );
        }
    }

    static async atualizar(req, res) {
        try {
            const endereco =
                await EnderecoService.atualizar(
                    req.usuario.id,
                    req.params.id,
                    req.body
                );

            return success(
                res,
                endereco,
                'Endereço atualizado com sucesso.'
            );

        } catch (err) {
            console.error('Erro ao atualizar endereço:', err);

            return error(
                res,
                err.message,
                err.codigo
            );
        }
    }

    static async definirPrincipal(req, res) {
        try {
            const endereco =
                await EnderecoService.definirPrincipal(
                    req.usuario.id,
                    req.params.id
                );

            return success(
                res,
                endereco,
                'Endereço definido como principal com sucesso.'
            );

        } catch (err) {
            console.error(
                'Erro ao definir endereço principal:',
                err
            );

            return error(
                res,
                err.message,
                err.codigo
            );
        }
    }

    static async desativar(req, res) {
        try {
            const endereco =
                await EnderecoService.desativar(
                    req.usuario.id,
                    req.params.id
                );

            return success(
                res,
                endereco,
                'Endereço desativado com sucesso.'
            );

        } catch (err) {
            console.error('Erro ao desativar endereço:', err);

            return error(
                res,
                err.message,
                err.codigo
            );
        }
    }
}

module.exports = EnderecoController;
