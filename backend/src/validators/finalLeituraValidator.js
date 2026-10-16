const { body, param, validationResult } = require('express-validator');

const validarResultado = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    return next();
};

const validarLivroId = [
    param('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),
    validarResultado
];

const validarRegistroFinal = [
    body('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),
    body('cena_id')
        .isUUID()
        .withMessage('cena_id deve ser um UUID válido.'),
    validarResultado
];

module.exports = { validarLivroId, validarRegistroFinal };
