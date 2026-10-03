const express = require('express');

const UsuarioCategoriaPreferidaController =
    require('../controllers/UsuarioCategoriaPreferidaController');

const autenticar = require('../middleware/autenticar');

const {
    validarBuscaPorId,
    validarAdicao,
    validarRemocao
} = require('../validators/usuarioCategoriaPreferidaValidator');

const router = express.Router();

router.get(
    '/',
    autenticar,
    UsuarioCategoriaPreferidaController.listarPorUsuario
);

router.get(
    '/:id',
    autenticar,
    validarBuscaPorId,
    UsuarioCategoriaPreferidaController.buscarPorId
);

router.post(
    '/',
    autenticar,
    validarAdicao,
    UsuarioCategoriaPreferidaController.adicionar
);

router.delete(
    '/:id',
    autenticar,
    validarRemocao,
    UsuarioCategoriaPreferidaController.remover
);

module.exports = router;
