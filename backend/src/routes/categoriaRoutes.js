const express = require('express');

const CategoriaController = require('../controllers/CategoriaController');

const router = express.Router();

router.get(
    '/biblioteca/:bibliotecaSlug',
    CategoriaController.listarPorBiblioteca
);

router.get(
    '/',
    CategoriaController.listar
);

module.exports = router;
