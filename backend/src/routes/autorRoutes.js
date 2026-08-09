const express = require('express');

const router = express.Router();

const AutorController = require('../controllers/AutorController');

const {
    validarCriacaoAutor,
    validarNomePublico,
    validarBiografia,
    validarFoto
} = require('../validators/autorValidator');


// Listar autores
router.get(
    '/',
    AutorController.listar
);


// Buscar autor por ID
router.get(
    '/:id',
    AutorController.buscarPorId
);


// Buscar autor por usuário
router.get(
    '/usuario/:usuario_id',
    AutorController.buscarPorUsuarioId
);


// Criar autor
router.post(
    '/',
    validarCriacaoAutor,
    AutorController.criar
);


// Alterar nome público
router.patch(
    '/:id/nome',
    validarNomePublico,
    AutorController.alterarNomePublico
);


// Alterar biografia
router.patch(
    '/:id/biografia',
    validarBiografia,
    AutorController.alterarBiografia
);


// Alterar foto
router.patch(
    '/:id/foto',
    validarFoto,
    AutorController.alterarFoto
);


// Desativar autor
router.delete(
    '/:id',
    AutorController.desativar
);


module.exports = router;
