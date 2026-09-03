function validarCriacaoLivroAutor(req, res, next) {
    const {
        livro_id,
        autor_id,
        ordem_exibicao
    } = req.body;

    if (!livro_id) {
        return res.status(400).json({
            success: false,
            message: 'livro_id é obrigatório.'
        });
    }

    if (!autor_id) {
        return res.status(400).json({
            success: false,
            message: 'autor_id é obrigatório.'
        });
    }

    if (
        ordem_exibicao === undefined ||
        !Number.isInteger(ordem_exibicao) ||
        ordem_exibicao <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: 'ordem_exibicao deve ser um número inteiro maior que zero.'
        });
    }

    next();
}


function validarAlteracaoOrdemExibicao(req, res, next) {
    const { ordem_exibicao } = req.body;

    if (
        ordem_exibicao === undefined ||
        !Number.isInteger(ordem_exibicao) ||
        ordem_exibicao <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: 'ordem_exibicao deve ser um número inteiro maior que zero.'
        });
    }

    next();
}


module.exports = {
    validarCriacaoLivroAutor,
    validarAlteracaoOrdemExibicao
};
