class ContratoValidator {

    static validarId(req, res, next) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'O ID do contrato é obrigatório.'
            });
        }

        next();
    }

    static validarCodigo(req, res, next) {
        const { codigo } = req.params;

        if (!codigo || typeof codigo !== 'string' || !codigo.trim()) {
            return res.status(400).json({
                success: false,
                message: 'O código do contrato é obrigatório.'
            });
        }

        next();
    }

    static validarContratoId(req, res, next) {
        const { contrato_id } = req.params;

        if (!contrato_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID do contrato é obrigatório.'
            });
        }

        next();
    }

    static validarVinculoContratoObra(req, res, next) {
        const { contrato_id, livro_id } = req.body;

        if (!contrato_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID do contrato é obrigatório.'
            });
        }

        if (!livro_id) {
            return res.status(400).json({
                success: false,
                message: 'O ID da obra é obrigatório.'
            });
        }

        next();
    }

static validarLivroId(req, res, next) {
    const { livro_id } = req.params;

    if (!livro_id) {
        return res.status(400).json({
            success: false,
            message: 'O ID da obra é obrigatório.'
        });
    }

    next();
}

}

module.exports = ContratoValidator;
