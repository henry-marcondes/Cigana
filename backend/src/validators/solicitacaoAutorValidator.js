class SolicitacaoAutorValidator {

    static validarCriacao(req, res, next) {
        const {
            nome_publico,
            biografia,
            foto_url,
            titulo_provisorio,
            resumo,
            categoria_id,
            classificacao_indicativa_id,
            idioma_id
        } = req.body;

        const erros = [];

        if (
            !nome_publico ||
            typeof nome_publico !== 'string' ||
            !nome_publico.trim()
        ) {
            erros.push('Nome público é obrigatório.');
        }

        if (
            !titulo_provisorio ||
            typeof titulo_provisorio !== 'string' ||
            !titulo_provisorio.trim()
        ) {
            erros.push('Título provisório da obra é obrigatório.');
        }

        if (
            !categoria_id ||
            typeof categoria_id !== 'string'
        ) {
            erros.push('Categoria é obrigatória.');
        }

        if (
            !classificacao_indicativa_id ||
            typeof classificacao_indicativa_id !== 'string'
        ) {
            erros.push('Classificação indicativa é obrigatória.');
        }

        if (
            !idioma_id ||
            typeof idioma_id !== 'string'
        ) {
            erros.push('Idioma é obrigatório.');
        }

        if (biografia !== undefined && biografia !== null) {
            if (typeof biografia !== 'string') {
                erros.push('Biografia deve ser um texto.');
            }
        }

        if (foto_url !== undefined && foto_url !== null) {
            if (typeof foto_url !== 'string') {
                erros.push('Foto deve ser uma URL válida.');
            }
        }

        if (resumo !== undefined && resumo !== null) {
            if (typeof resumo !== 'string') {
                erros.push('Resumo deve ser um texto.');
            }
        }

        if (erros.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos.',
                errors: erros
            });
        }

        req.body = {
            nome_publico: nome_publico.trim(),
            biografia:
                typeof biografia === 'string'
                    ? biografia.trim()
                    : null,
            foto_url:
                typeof foto_url === 'string'
                    ? foto_url.trim()
                    : null,
            titulo_provisorio: titulo_provisorio.trim(),
            resumo:
                typeof resumo === 'string'
                    ? resumo.trim()
                    : null,
            categoria_id: categoria_id.trim(),
            classificacao_indicativa_id:
                classificacao_indicativa_id.trim(),
            idioma_id: idioma_id.trim()
        };

        next();
    }

    static validarId(req, res, next) {
        const { id } = req.params;

        if (!id || typeof id !== 'string' || !id.trim()) {
            return res.status(400).json({
                success: false,
                message: 'ID da solicitação é obrigatório.'
            });
        }

        req.params.id = id.trim();

        next();
    }

    static validarRecusa(req, res, next) {
        const { motivo_recusa } = req.body;

        if (
            !motivo_recusa ||
            typeof motivo_recusa !== 'string' ||
            !motivo_recusa.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Motivo da recusa é obrigatório.'
            });
        }

        req.body.motivo_recusa = motivo_recusa.trim();

        next();
    }
}

module.exports = SolicitacaoAutorValidator;
