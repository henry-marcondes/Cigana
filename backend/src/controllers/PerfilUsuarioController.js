const PerfilUsuarioService = require('../services/PerfilUsuarioService');
const { success, error } = require('../utils/apiResponse');


class PerfilUsuarioController {

    async listar(req, res) {
        try {
            const perfis = await PerfilUsuarioService.listarPerfis();
            return success( res, perfis, 'Perfis listados com sucesso');

        } catch (err) {
            return error( res, err.message, 500 );
        }
    }


    async buscarPorId(req, res) {
        try {
            const perfil =
                await PerfilUsuarioService.buscarPerfilPorId(req.params.id);
            return success( res, perfil, 'Perfil encontrado com sucesso');

        } catch (err) {
            return error( res, err.message, 404);
        }
    }


    async buscarPorUsuario(req, res) {
        try {
            const perfil =
                await PerfilUsuarioService.buscarPerfilPorUsuario(
                    req.params.usuario_id );
            return success( res, perfil,  'Perfil encontrado com sucesso' );
        } catch (err) {
            return error( res, err.message, 404  );
        }
    }


    async criar(req, res) {
        try {
            const perfil =
                await PerfilUsuarioService.criarPerfil( req.body );
            return success( res, perfil, 'Perfil criado com sucesso', 201 );
        } catch (err) {
            return error( res,  err.message,  400 );
        }
    }


    async alterarDadosPessoais(req, res) {
        try {
            const perfil =
                await PerfilUsuarioService.alterarDadosPessoais(
                    req.params.id, req.body );
            return success( res, perfil, 'Dados pessoais alterados com sucesso' );

        } catch (err) {
            return error( res, err.message, 400 );
        }
    }


    async alterarNomeUsuario(req, res) {
        try {
            const perfil =
                await PerfilUsuarioService.alterarNomeUsuario(
                    req.params.id, req.body.nome_usuario );
            return success( res, perfil, 'Nome de usuário alterado com sucesso' );

        } catch (err) {
            return error( res, err.message, 400 );
        }
    }


    async alterarAvatar(req, res) {
        try {
            const perfil =
                await PerfilUsuarioService.alterarAvatar(
                    req.params.id, req.body.avatar_url );
            return success( res, perfil, 'Avatar alterado com sucesso' );

        } catch (err) {
            return error( res, err.message, 400 );
        }
    }


    async alterarBiografia(req, res) {
        try {
            const perfil =
                await PerfilUsuarioService.alterarBiografia(
                    req.params.id, req.body.biografia );
            return success( res, perfil, 'Biografia alterada com sucesso' );

        } catch (err) {
            return error( res, err.message, 400 );
        }
    }


    async alterarIdioma(req, res) {
        try {
            const perfil =
                await PerfilUsuarioService.alterarIdioma(
                    req.params.id, req.body.idioma_id );
            return success( res, perfil, 'Idioma alterado com sucesso' );

        } catch (err) {
            return error( res, err.message, 400 );
        }
    }


    async excluir(req, res) {
        try {
            await PerfilUsuarioService.excluirPerfil( req.params.id );
            return success( res, null, 'Perfil desativado com sucesso' );

        } catch (err) {
            return error( res, err.message, 404 );
        }
    }

}


module.exports = new PerfilUsuarioController();
