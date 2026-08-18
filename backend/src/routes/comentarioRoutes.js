const express = require('express');

const ComentarioController = require('../controllers/ComentarioController');

const {
    validarId,
    validarUsuarioId,
    validarLivroId,
    validarCriacaoComentario,
    validarAlteracaoTexto
} = require('../validators/comentarioValidator');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Listar comentários por livro
|--------------------------------------------------------------------------
*/
router.get(
    '/livro/:livro_id',
    validarLivroId,
    ComentarioController.listarPorLivro
);

/*
|--------------------------------------------------------------------------
| Listar comentários por usuário
|--------------------------------------------------------------------------
*/
router.get(
    '/usuario/:usuario_id',
    validarUsuarioId,
    ComentarioController.listarPorUsuario
);

/*
|--------------------------------------------------------------------------
| Buscar comentário por ID
|--------------------------------------------------------------------------
*/
router.get(
    '/:id',
    validarId,
    ComentarioController.buscarPorId
);

/*
|--------------------------------------------------------------------------
| Criar comentário
|--------------------------------------------------------------------------
*/
router.post(
    '/',
    validarCriacaoComentario,
    ComentarioController.criar
);

/*
|--------------------------------------------------------------------------
| Alterar texto do comentário
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id/texto',
    validarAlteracaoTexto,
    ComentarioController.alterarTexto
);

/*
|--------------------------------------------------------------------------
| Desativar comentário
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id/desativar',
    validarId,
    ComentarioController.desativar
);

module.exports = router;
