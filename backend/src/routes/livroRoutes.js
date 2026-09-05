const express = require('express');

const LivroController = require('../controllers/LivroController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');

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
    autenticar,
    autorizar('obra.criar'),
    validarCriacaoLivro,
    LivroController.criar
);

router.put(
    '/:id',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoInformacoesLivro,
    LivroController.alterarInformacoes
);

router.patch(
    '/:id/status',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoStatusLivro,
    LivroController.alterarStatus
);

router.patch(
    '/:id/visibilidade',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoVisibilidadeLivro,
    LivroController.alterarVisibilidade
);

router.patch(
    '/:id/capa',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoCapaLivro,
    LivroController.alterarCapa
);

router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    LivroController.desativar
);
module.exports = router;
