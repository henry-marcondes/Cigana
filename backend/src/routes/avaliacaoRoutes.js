const express = require('express');

const AvaliacaoController = require('../controllers/AvaliacaoController');

const {
    validarId,
    validarLivroId,
    validarUsuarioId,
    validarUsuarioELivro,
    validarCriacaoAvaliacao,
    validarAlteracaoNota,
    validarAlteracaoComentario
} = require('../validators/avaliacaoValidator');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Listar avaliações por livro
|--------------------------------------------------------------------------
*/
router.get(
    '/livro/:livro_id',
    validarLivroId,
    AvaliacaoController.listarPorLivro
);

/*
|--------------------------------------------------------------------------
| Listar avaliações por usuário
|--------------------------------------------------------------------------
*/
router.get(
    '/usuario/:usuario_id',
    validarUsuarioId,
    AvaliacaoController.listarPorUsuario
);

/*
|--------------------------------------------------------------------------
| Buscar avaliação por usuário e livro
|--------------------------------------------------------------------------
*/
router.get(
    '/usuario/:usuario_id/livro/:livro_id',
    validarUsuarioELivro,
    AvaliacaoController.buscarPorUsuarioELivro
);

/*
|--------------------------------------------------------------------------
| Buscar avaliação por ID
|--------------------------------------------------------------------------
*/
router.get(
    '/:id',
    validarId,
    AvaliacaoController.buscarPorId
);

/*
|--------------------------------------------------------------------------
| Criar avaliação
|--------------------------------------------------------------------------
*/
router.post(
    '/',
    validarCriacaoAvaliacao,
    AvaliacaoController.criar
);

/*
|--------------------------------------------------------------------------
| Alterar nota
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id/nota',
    validarAlteracaoNota,
    AvaliacaoController.alterarNota
);

/*
|--------------------------------------------------------------------------
| Alterar comentário
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id/comentario',
    validarAlteracaoComentario,
    AvaliacaoController.alterarComentario
);

/*
|--------------------------------------------------------------------------
| Desativar avaliação
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id/desativar',
    validarId,
    AvaliacaoController.desativar
);

module.exports = router;
