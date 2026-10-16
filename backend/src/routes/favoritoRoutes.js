const express = require('express');

const FavoritoController = require('../controllers/FavoritoController');
const autenticar = require('../middleware/autenticar');
const protegerLeituraObra = require('../middleware/protegerLeituraObra');

const {
    validarLivroIdParam,
    validarCriacaoFavorito
} = require('../validators/favoritoValidator');

const router = express.Router();

// Listar favoritos do usuário autenticado
router.get(
    '/',
    autenticar,
    FavoritoController.listar
);

// Consultar se uma obra está favoritada
router.get(
    '/livro/:livro_id',
    autenticar,
    validarLivroIdParam,
    protegerLeituraObra(async (req) => req.params.livro_id),
    FavoritoController.buscarPorLivro
);

// Adicionar uma obra aos favoritos
router.post(
    '/',
    autenticar,
    validarCriacaoFavorito,
    protegerLeituraObra(async (req) => req.body.livro_id),
    FavoritoController.criar
);

// Remover uma obra dos favoritos do usuário autenticado
router.delete(
    '/livro/:livro_id',
    autenticar,
    validarLivroIdParam,
    FavoritoController.removerPorLivro
);

module.exports = router;
