const { body, param, validationResult } = require('express-validator');

const validarUUID = (campo) =>
    param(campo)
        .isUUID()
        .withMessage(`${campo} deve ser um UUID válido.`);

const tratarErrosValidacao = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

// Validação para buscar uma relação por ID
const validarBuscaPorId = [
    validarUUID('id'),

    tratarErrosValidacao
];

// Validação para adicionar preferência ao usuário autenticado
const validarAdicao = [
    body('preferencia_id')
        .isUUID()
        .withMessage('preferencia_id deve ser um UUID válido.'),

    tratarErrosValidacao
];

// Validação para remover preferência
const validarRemocao = [
    validarUUID('id'),

    tratarErrosValidacao
];

module.exports = {
    validarBuscaPorId,
    validarAdicao,
    validarRemocao
};
