const express = require('express');

const LivroController = require('../controllers/LivroController');

const {
    validarCriacaoLivro,
    validarAlteracaoInformacoesLivro,
    validarAlteracaoStatusLivro,
    validarAlteracaoVisibilidadeLivro,
    validarAlteracaoCapaLivro
} = require('../validators/livroValidator');

const router = express.Router();

router.get(
    '/',
    LivroController.listar
);

router.get(
    '/slug/:slug',
    LivroController.buscarPorSlug
);

router.get(
    '/:id',
    LivroController.buscarPorId
);

router.post(
    '/',
    validarCriacaoLivro,
    LivroController.criar
);

router.put(
    '/:id',
    validarAlteracaoInformacoesLivro,
    LivroController.alterarInformacoes
);

router.patch(
    '/:id/status',
    validarAlteracaoStatusLivro,
    LivroController.alterarStatus
);

router.patch(
    '/:id/visibilidade',
    validarAlteracaoVisibilidadeLivro,
    LivroController.alterarVisibilidade
);

router.patch(
    '/:id/capa',
    validarAlteracaoCapaLivro,
    LivroController.alterarCapa
);

router.delete(
    '/:id',
    LivroController.desativar
);

module.exports = router;
