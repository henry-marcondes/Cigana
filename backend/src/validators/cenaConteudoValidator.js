const { body, param } = require('express-validator');

const validarUUID = (campo) =>
    param(campo)
        .isUUID()
        .withMessage(`${campo} inválido.`);

const validarTipoConteudo = body('tipo_conteudo')
    .trim()
    .notEmpty()
    .withMessage('Tipo de conteúdo é obrigatório.')
    .isIn([
        'TEXTO',
        'IMAGEM',
        'AUDIO',
        'VIDEO'
    ])
    .withMessage(
        'Tipo de conteúdo deve ser TEXTO, IMAGEM, AUDIO ou VIDEO.'
    );

const validarCriacaoCenaConteudo = [
    body('cena_id')
        .notEmpty()
        .withMessage('ID da cena é obrigatório.')
        .isUUID()
        .withMessage('ID da cena inválido.'),

    validarTipoConteudo,

    body('conteudo_id')
        .notEmpty()
        .withMessage('ID do conteúdo é obrigatório.')
        .isUUID()
        .withMessage('ID do conteúdo inválido.'),

    body('ordem_exibicao')
        .notEmpty()
        .withMessage('Ordem de exibição é obrigatória.')
        .isInt({ min: 1 })
        .withMessage('Ordem de exibição deve ser um número inteiro maior que zero.')
];

const validarAlteracaoOrdem = [
    validarUUID('id'),

    body('ordem_exibicao')
        .notEmpty()
        .withMessage('Ordem de exibição é obrigatória.')
        .isInt({ min: 1 })
        .withMessage('Ordem de exibição deve ser um número inteiro maior que zero.')
];

const validarAlteracaoTipoConteudo = [
    validarUUID('id'),

    validarTipoConteudo
];

const validarIdCenaConteudo = [
    validarUUID('id')
];

const validarIdCena = [
    validarUUID('cena_id')
];

module.exports = {
    validarCriacaoCenaConteudo,
    validarAlteracaoOrdem,
    validarAlteracaoTipoConteudo,
    validarIdCenaConteudo,
    validarIdCena
};
