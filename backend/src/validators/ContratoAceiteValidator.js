class ContratoAceiteValidator {

    static validarId(req, res, next) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'O ID do aceite é obrigatório.'
            });
        }

        next();
    }

    static validarContratoVersaoId(req, res, next) {
        const { contrato_versao_id } = req.params;

        if (!contrato_versao_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID da versão do contrato é obrigatório.'
            });
        }

        next();
    }

    static validarUsuarioId(req, res, next) {
        const { usuario_id } = req.params;

        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID do usuário é obrigatório.'
            });
        }

        next();
    }

    static validarVersaoEUsuario(req, res, next) {
        const {
            contrato_versao_id,
            usuario_id
        } = req.params;

        if (!contrato_versao_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID da versão do contrato é obrigatório.'
            });
        }

        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID do usuário é obrigatório.'
            });
        }

        next();
    }

    static validarCriacao(req, res, next) {
        const {
            contrato_versao_id,
            usuario_id
        } = req.body;

        if (!contrato_versao_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID da versão do contrato é obrigatório.'
            });
        }

        if (!usuario_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID do usuário é obrigatório.'
            });
        }

        next();
    }

}

module.exports = ContratoAceiteValidator;
