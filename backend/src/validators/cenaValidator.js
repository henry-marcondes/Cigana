
const { body, param } = require('express-validator');

const validarCriacaoCena = [
body('capitulo_id')
.notEmpty()
.withMessage('O capítulo é obrigatório.')
.isUUID()
.withMessage('O capítulo deve ser um UUID válido.'),

body('titulo')
    .notEmpty()
    .withMessage('O título é obrigatório.')
    .isString()
    .withMessage('O título deve ser um texto.'),

body('slug')
    .notEmpty()
    .withMessage('O slug é obrigatório.')
    .isString()
    .withMessage('O slug deve ser um texto.'),

body('texto')
    .notEmpty()
    .withMessage('O texto é obrigatório.')
    .isString()
    .withMessage('O texto deve ser um texto.'),

body('ordem_exibicao')
    .notEmpty()
    .withMessage('A ordem de exibição é obrigatória.')
    .isInt({ min: 1 })
    .withMessage('A ordem de exibição deve ser um número inteiro maior que zero.'),

body('cena_inicial')
    .optional()
    .isBoolean()
    .withMessage('cena_inicial deve ser um valor booleano.')

];

const validarAlteracaoCena = [
param('id')
.isUUID()
.withMessage('O ID da cena deve ser um UUID válido.'),

body('titulo')
    .notEmpty()
    .withMessage('O título é obrigatório.')
    .isString()
    .withMessage('O título deve ser um texto.'),

body('slug')
    .notEmpty()
    .withMessage('O slug é obrigatório.')
    .isString()
    .withMessage('O slug deve ser um texto.'),

body('texto')
    .notEmpty()
    .withMessage('O texto é obrigatório.')
    .isString()
    .withMessage('O texto deve ser um texto.'),

body('ordem_exibicao')
    .notEmpty()
    .withMessage('A ordem de exibição é obrigatória.')
    .isInt({ min: 1 })
    .withMessage('A ordem de exibição deve ser um número inteiro maior que zero.')

];

const validarIdCena = [
param('id')
.isUUID()
.withMessage('O ID da cena deve ser um UUID válido.')
];

const validarCapituloCena = [
param('capitulo_id')
.isUUID()
.withMessage('O ID do capítulo deve ser um UUID válido.')
];

const validarSlugCena = [
param('capitulo_id')
.isUUID()
.withMessage('O ID do capítulo deve ser um UUID válido.'),

param('slug')
    .notEmpty()
    .withMessage('O slug é obrigatório.')
    .isString()
    .withMessage('O slug deve ser um texto.')

];

module.exports = {
validarCriacaoCena,
validarAlteracaoCena,
validarIdCena,
validarCapituloCena,
validarSlugCena
};
