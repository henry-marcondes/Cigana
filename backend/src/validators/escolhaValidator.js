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

// Validação para criação de Escolha
const validarCriacaoEscolha = [
    body('cena_origem_id')
        .isUUID()
        .withMessage('cena_origem_id deve ser um UUID válido.'),

    body('cena_destino_id')
        .isUUID()
        .withMessage('cena_destino_id deve ser um UUID válido.'),

    body('texto')
        .trim()
        .notEmpty()
        .withMessage('texto é obrigatório.'),

    body('ordem_exibicao')
        .isInt({ min: 1 })
        .withMessage('ordem_exibicao deve ser um número inteiro maior ou igual a 1.'),

    tratarErrosValidacao
];

// Validação para alteração do texto
const validarAlteracaoTexto = [
    validarUUID('id'),

    body('texto')
        .trim()
        .notEmpty()
        .withMessage('texto é obrigatório.'),

    tratarErrosValidacao
];

// Validação para alteração do destino
const validarAlteracaoDestino = [
    validarUUID('id'),

    body('cena_destino_id')
        .isUUID()
        .withMessage('cena_destino_id deve ser um UUID válido.'),

    tratarErrosValidacao
];

// Validação para alteração da ordem de exibição
const validarAlteracaoOrdemExibicao = [
    validarUUID('id'),

    body('ordem_exibicao')
        .isInt({ min: 1 })
        .withMessage('ordem_exibicao deve ser um número inteiro maior ou igual a 1.'),

    tratarErrosValidacao
];

// Validação para busca por ID
const validarBuscaPorId = [
    validarUUID('id'),

    tratarErrosValidacao
];

// Validação para listar escolhas de uma cena
const validarListagemPorCenaOrigem = [
    validarUUID('cena_origem_id'),

    tratarErrosValidacao
];

// Validação para desativação
const validarDesativacao = [
    validarUUID('id'),

    tratarErrosValidacao
];

module.exports = {
    validarCriacaoEscolha,
    validarAlteracaoTexto,
    validarAlteracaoDestino,
    validarAlteracaoOrdemExibicao,
    validarBuscaPorId,
    validarListagemPorCenaOrigem,
    validarDesativacao
};
