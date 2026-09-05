const { validate: validarUUID } = require('uuid');

function validarCriacaoPapelPermissao(req, res, next) {

    const {
        papel_id,
        permissao_id
    } = req.body;

    if (!papel_id || typeof papel_id !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'papel_id é obrigatório e deve ser um UUID válido.'
        });
    }

    if (!validarUUID(papel_id)) {
        return res.status(400).json({
            success: false,
            message: 'papel_id deve ser um UUID válido.'
        });
    }

    if (!permissao_id || typeof permissao_id !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'permissao_id é obrigatório e deve ser um UUID válido.'
        });
    }

    if (!validarUUID(permissao_id)) {
        return res.status(400).json({
            success: false,
            message: 'permissao_id deve ser um UUID válido.'
        });
    }

    next();
}

module.exports = {
    validarCriacaoPapelPermissao
};
