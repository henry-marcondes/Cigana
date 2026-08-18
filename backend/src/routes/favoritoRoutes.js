const express = require('express');

const FavoritoController = require('../controllers/FavoritoController');

const {
    validarId,
    validarCriacaoFavorito,
    validarUsuarioELivro,
    validarUsuarioId
} = require('../validators/favoritoValidator');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Listar favoritos por usuário
|--------------------------------------------------------------------------
*/
router.get(
    '/usuario/:usuario_id',
    validarUsuarioId,
    FavoritoController.listarPorUsuario
);

/*
|--------------------------------------------------------------------------
| Buscar favorito por usuário e livro
|--------------------------------------------------------------------------
*/
router.get(
    '/usuario/:usuario_id/livro/:livro_id',
    validarUsuarioELivro,
    FavoritoController.buscarPorUsuarioELivro
);

/*
|--------------------------------------------------------------------------
| Buscar favorito por ID
|--------------------------------------------------------------------------
*/
router.get(
    '/:id',
    validarId,
    FavoritoController.buscarPorId
);

/*
|--------------------------------------------------------------------------
| Criar favorito
|--------------------------------------------------------------------------
*/
router.post(
    '/',
    validarCriacaoFavorito,
    FavoritoController.criar
);

/*
|--------------------------------------------------------------------------
| Desativar favorito
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id/desativar',
    validarId,
    FavoritoController.desativar
);

module.exports = router;
