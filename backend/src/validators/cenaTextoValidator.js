const { body, param } = require('express-validator');

const validarUUID = (campo) =>
    param(campo)
        .isUUID()
        .withMessage(`${campo} inválido.`);

const validarCriacaoCenaTexto = [
    body('cena_id')
        .isUUID()
        .withMessage('ID da cena inválido.')
        .notEmpty()
        .withMessage('ID da cena é obrigatório.'),

    body('texto_url')
        .trim()
        .notEmpty()
        .withMessage('URL do texto é obrigatória.')
        .isString()
        .withMessage('URL do texto deve ser uma string.')
        .isLength({ max: 1000 })
        .withMessage('URL do texto deve ter no máximo 1000 caracteres.')
];

const validarAlteracaoCenaTexto = [
    validarUUID('id'),

    body('texto_url')
        .trim()
        .notEmpty()
        .withMessage('URL do texto é obrigatória.')
        .isString()
        .withMessage('URL do texto deve ser uma string.')
        .isLength({ max: 1000 })
        .withMessage('URL do texto deve ter no máximo 1000 caracteres.')
];

const validarIdCenaTexto = [
    validarUUID('id')
];

const validarIdCena = [
    validarUUID('cena_id')
];

module.exports = {
    validarCriacaoCenaTexto,
    validarAlteracaoCenaTexto,
    validarIdCenaTexto,
    validarIdCena
};
