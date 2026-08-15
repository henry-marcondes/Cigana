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

// Validação para criação de imagem da cena
const validarCriacaoCenaImagem = [
    body('cena_id')
        .isUUID()
        .withMessage('cena_id deve ser um UUID válido.'),

    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('titulo é obrigatório.'),

    body('legenda')
        .optional({ nullable: true })
        .trim(),

    body('texto_alternativo')
        .trim()
        .notEmpty()
        .withMessage('texto_alternativo é obrigatório.'),

    body('imagem_url')
        .trim()
        .notEmpty()
        .withMessage('imagem_url é obrigatório.')
        .isURL({
            require_protocol: true,
            require_tld: false
        })
        .withMessage('imagem_url deve ser uma URL válida.'),

    body('ordem_exibicao')
        .isInt({ min: 1 })
        .withMessage(
            'ordem_exibicao deve ser um número inteiro maior ou igual a 1.'
        ),

    tratarErrosValidacao
];

// Validação para alteração das informações
const validarAlteracaoInformacoes = [
    validarUUID('id'),

    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('titulo é obrigatório.'),

    body('legenda')
        .optional({ nullable: true })
        .trim(),

    body('texto_alternativo')
        .trim()
        .notEmpty()
        .withMessage('texto_alternativo é obrigatório.'),

    body('ordem_exibicao')
        .isInt({ min: 1 })
        .withMessage(
            'ordem_exibicao deve ser um número inteiro maior ou igual a 1.'
        ),

    tratarErrosValidacao
];

// Validação para alteração da imagem
const validarAlteracaoImagem = [
    validarUUID('id'),

    body('imagem_url')
        .trim()
        .notEmpty()
        .withMessage('imagem_url é obrigatório.')
        .isURL({
            require_protocol: true,
            require_tld: false
        })
        .withMessage('imagem_url deve ser uma URL válida.'),

    tratarErrosValidacao
];

// Validação para busca por ID
const validarBuscaPorId = [
    validarUUID('id'),

    tratarErrosValidacao
];

// Validação para listar imagens por cena
const validarListagemPorCena = [
    validarUUID('cena_id'),

    tratarErrosValidacao
];

// Validação para desativação
const validarDesativacao = [
    validarUUID('id'),

    tratarErrosValidacao
];

module.exports = {
    validarCriacaoCenaImagem,
    validarAlteracaoInformacoes,
    validarAlteracaoImagem,
    validarBuscaPorId,
    validarListagemPorCena,
    validarDesativacao
};
