const { param, query, body, header, validationResult } = require('express-validator');
const validar = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) return res.status(400).json({ success: false, errors: result.array() });
    return next();
};
const validarLivro = [param('livro_id').isUUID().withMessage('livro_id deve ser UUID.'), validar];
const validarIds = [param('livro_id').isUUID(), param('arquivo_id').isUUID(), validar];
const validarTexto = [param('texto_id').isUUID(), validar];
const validarUpload = [
    param('livro_id').isUUID(),
    query('papel').optional().isIn(['PRINCIPAL', 'SECUNDARIO']),
    body().custom((_, { req }) => typeof req.get('X-Nome-Original') === 'string' && req.get('X-Nome-Original').trim() !== '').withMessage('X-Nome-Original é obrigatório.'),
    validar
];
const validarSalvar = [
    param('livro_id').isUUID(), param('arquivo_id').isUUID(),
    header('x-hash-esperado').matches(/^[a-f0-9]{64}$/i).withMessage('X-Hash-Esperado inválido.'),
    body().custom((_, { req }) => Buffer.isBuffer(req.body) && Buffer.from(req.body.toString('utf8'), 'utf8').equals(req.body))
        .withMessage('O corpo deve conter Markdown UTF-8 válido.'),
    validar
];
module.exports = { validarLivro, validarIds, validarTexto, validarUpload, validarSalvar };
