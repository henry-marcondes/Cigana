const UsuarioService = require('../services/usuarioService');
const { success, error } = require('../utils/apiResponse');

class UsuarioController {

    static async listar(req, res) {

        try {
            const usuarios = await UsuarioService.listarUsuarios();
            return success(res, usuarios);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                erro: 'Erro interno do servidor'
            });
        }
    }

    static async buscarPorId(req, res){
        try{
            const { id } = req.params;
            const usuario = await UsuarioService.buscarUsuarioPorId(id);
            if(!usuario) {
                return error(res,'Usuario não Encontrado.', 404);
            } 
            return success(res, usuario);
        } catch(error){
            console.error(error);
            return error(res, 'Erro interno do servidor.', 500);
       }
    }

    static async criar(req, res) {
        try {
            const usuario = await UsuarioService.criarUsuario(req.body);
            return success(res, usuario, 'Usuário criado com sucesso.', 201);
        } catch (err) {
            if (err.message === 'EMAIL_JA_CADASTRADO') {
                return error(res, 'E-mail já cadastrado.', 409);
            }
        console.error(err);
            return error(res, 'Erro interno do servidor.', 500);
            }
    }

    static async atualizar(req, res, next) {
        try {
            const usuario = await UsuarioService.atualizarUsuario(
                req.params.id, req.body );

            return success(res, usuario,'Usuário atualizado com sucesso.');

        } catch (err) {
            if (err.message === 'USUARIO_NAO_ENCONTRADO') {
                return error(res, 'Usuário não encontrado.', 404);
            }

            if (err.message === 'EMAIL_JA_CADASTRADO') {
                return error(res, 'E-mail já cadastrado.', 409);
            }

            next(err);
        }
    }

    static async alterarSenha(req, res, next) {
        try {
            const usuario = await UsuarioService.alterarSenhaUsuario(
                req.params.id,  req.body.senha
        );
        return success( res, usuario, 'Senha alterada com sucesso.' );

        } catch (err) {
            if (err.message === 'USUARIO_NAO_ENCONTRADO') {
                return error( res,    'Usuário não encontrado.', 404 );
            }
        
            console.error(err);
            return next(err);
        }
    }   

   static async solicitarVerificacaoEmail(req, res) {
    try {
        const resultado =
            await UsuarioService.solicitarVerificacaoEmail(
                req.params.id
            );

        return success(
            res,
            resultado,
            'Código de verificação enviado com sucesso.'
        );
    } catch (err) {
        return error(res, err.message);
    }
}

    static async verificarEmail(req, res) {
    try {
        const resultado =
            await UsuarioService.verificarEmail(
                req.params.id,
                req.body.token
            );

        return success(
            res,
            resultado,
            'E-mail verificado com sucesso.'
        );
    } catch (err) {
        return error(res, err.message);
    }
}

    static async solicitarAlteracaoSenha(req, res) {
    try {
        const resultado =
            await UsuarioService.solicitarAlteracaoSenha(
                req.params.id
            );

        return success(
            res,
            resultado,
            'Código para alteração de senha enviado com sucesso.'
        );
    } catch (err) {
        return error(res, err.message);
    }
}

    static async alterarSenhaComToken(req, res) {
    try {
        const resultado =
            await UsuarioService.alterarSenhaComToken(
                req.params.id,
                req.body.token,
                req.body.senha
            );

        return success(
            res,
            resultado,
            'Senha alterada com sucesso.'
        );
    } catch (err) {
        return error(res, err.message);
    }
}

    static async solicitarRecuperacaoSenha(req, res) {
        try {
        const resultado =
            await UsuarioService.solicitarRecuperacaoSenha(
                req.body.email
            );

        return success(
            res,
            resultado,
            'Se o e-mail estiver cadastrado, um código de recuperação será enviado.'
        );
    } catch (err) {
        return error(res, err.message);
     }
  }

    static async recuperarSenhaComToken(req, res) {
      try {
        const resultado =
            await UsuarioService.recuperarSenhaComToken(
                req.body.email,
                req.body.token,
                req.body.senha
            );

        return success(
            res,
            resultado,
            'Senha recuperada com sucesso.'
        );
    } catch (err) {
        return error(res, err.message);
    }
  }

    static async desativar(req, res, next) {

        try {
            await UsuarioService.desativarUsuario(req.params.id);
            return success( res,    null,   'Usuário desativado com sucesso.');
        } catch (err) {
            if (err.message === 'USUARIO_NAO_ENCONTRADO') {
                return error( res, 'Usuário não encontrado.', 404 );}

            console.error(err);
            next(err);
        }
    }


}

module.exports = UsuarioController;
