const {
    body,
    param,
    validationResult
} = require('express-validator');

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

// Valida o livro_id recebido pela URL.
const validarLivroIdParam = [
    param('livro_id')
        .isUUID()
        .withMessage('ID da obra deve ser um UUID válido.'),

    validarResultado
];

// Valida a criação de um favorito.
// O usuario_id não é recebido do cliente.
const validarCriacaoFavorito = [
    body('livro_id')
        .isUUID()
        .withMessage('livro_id deve ser um UUID válido.'),

    validarResultado
];

module.exports = {
    validarLivroIdParam,
    validarCriacaoFavorito
};
