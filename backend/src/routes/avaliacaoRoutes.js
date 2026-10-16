const express = require('express');

const AvaliacaoController = require('../controllers/AvaliacaoController');
const autenticar = require('../middleware/autenticar');

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
    autenticar,
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
    autenticar,
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
    autenticar,
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
    autenticar,
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
    autenticar,
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
    autenticar,
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
    autenticar,
    validarId,
    AvaliacaoController.desativar
);

module.exports = router;
