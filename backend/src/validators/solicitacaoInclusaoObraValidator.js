const CAMPOS = [
    'titulo', 'slug', 'categoria_id', 'classificacao_indicativa_id', 'idioma_id'
];

function validarProposta(req, res, next) {
    const dados = req.body || {};
    const erros = [];
    for (const campo of CAMPOS) {
        if (typeof dados[campo] !== 'string' || !dados[campo].trim()) {
            erros.push(`${campo} é obrigatório.`);
        } else if (campo.endsWith('_id') && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(dados[campo])) {
            erros.push(`${campo} deve ser um UUID válido.`);
        }
    }
    if (dados.resumo !== undefined && dados.resumo !== null && typeof dados.resumo !== 'string') {
        erros.push('resumo deve ser um texto.');
    }
    if (erros.length) {
        return res.status(400).json({ success: false, message: 'Dados inválidos.', errors: erros });
    }
    req.body = Object.fromEntries([...CAMPOS, 'resumo'].map((campo) => [
        campo, typeof dados[campo] === 'string' ? dados[campo].trim() : null
    ]));
    return next();
}

function validarId(req, res, next) {
    if (!req.params.id || typeof req.params.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) {
        return res.status(400).json({ success: false, message: 'ID da solicitação deve ser um UUID válido.' });
    }
    return next();
}

function validarRejeicao(req, res, next) {
    const motivo = req.body?.motivo_rejeicao;
    if (typeof motivo !== 'string' || !motivo.trim()) {
        return res.status(400).json({ success: false, message: 'O motivo da rejeição é obrigatório.' });
    }
    req.body.motivo_rejeicao = motivo.trim();
    return next();
}

module.exports = { validarProposta, validarId, validarRejeicao };
