const { body, param } = require('express-validator');

const validarUUID = (campo) =>
    param(campo)
        .isUUID()
        .withMessage(`${campo} inválido.`);

const validarCriacaoCenaTexto = [
    body('livro_id').optional().isUUID().withMessage('livro_id inválido.'),
    body('cena_id').optional().isUUID().withMessage('ID da cena inválido.'),
    body().custom((_, { req }) => Boolean(req.body?.livro_id || req.body?.cena_id))
        .withMessage('Informe livro_id ou cena_id.'),

    body('titulo').optional().trim().isString().isLength({ max: 500 })
        .withMessage('titulo deve ter no máximo 500 caracteres.'),

    body('arquivo_id').optional().isUUID().withMessage('arquivo_id inválido.'),

    body('conteudo').optional().isString().withMessage('conteudo deve ser uma string.'),

    body().custom((_, { req }) => !req.body?.arquivo_id || Boolean(req.body?.cena_id))
        .withMessage('Documentos Markdown gerenciados exigem cena_id.'),

    body('texto_url')
        .if((_, { req }) => !req.body?.arquivo_id && Boolean(req.body?.cena_id))
        .trim()
        .notEmpty()
        .withMessage('URL do texto é obrigatória.')
        .isString()
        .withMessage('URL do texto deve ser uma string.')
        .isLength({ max: 1000 })
        .withMessage('URL do texto deve ter no máximo 1000 caracteres.'),

    body().custom((_, { req }) => {
        if (req.body?.arquivo_id) return true;
        if (req.body?.cena_id) return typeof req.body?.texto_url === 'string' && req.body.texto_url.trim();
        return typeof req.body?.titulo === 'string' && req.body.titulo.trim() && typeof req.body?.conteudo === 'string';
    }).withMessage('Texto independente exige título e conteúdo; textos de cena exigem texto_url ou arquivo Markdown.')
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
