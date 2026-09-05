const { validate: validarUUID } = require('uuid');

function validarCriacaoUsuarioPapel(req, res, next) {

    const {
        usuario_id,
        papel_id
    } = req.body;

    if (!usuario_id || typeof usuario_id !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'usuario_id é obrigatório e deve ser um UUID válido.'
        });
    }

    if (!validarUUID(usuario_id)) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id deve ser um UUID válido.'
        });
    }

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

    next();
}

module.exports = {
    validarCriacaoUsuarioPapel
};
