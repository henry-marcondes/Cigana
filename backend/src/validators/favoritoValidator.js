const { body, param, validationResult } = require('express-validator');

const validarResultado = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

const validarId = [
    param('id')
        .isUUID()
        .withMessage('ID do favorito deve ser um UUID válido.'),

    validarResultado
];

const validarCriacaoFavorito = [
    body('usuario_id')
        .isUUID()
        .withMessage('usuario_id deve ser um UUID válido.'),

    body('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),

    validarResultado
];

const validarUsuarioELivro = [
    param('usuario_id')
        .isUUID()
        .withMessage('usuario_id deve ser um UUID válido.'),

    param('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),

    validarResultado
];

const validarUsuarioId = [
    param('usuario_id')
        .isUUID()
        .withMessage('usuario_id deve ser um UUID válido.'),

    validarResultado
];

module.exports = {
    validarId,
    validarCriacaoFavorito,
    validarUsuarioELivro,
    validarUsuarioId
};
