const express = require('express');

const PreferenciaController = require('../controllers/PreferenciaController');

const {
    validarCriacaoPreferencia,
    validarBuscaPorCodigo
} = require('../validators/preferenciaValidator');

const router = express.Router();

// Listar todas as preferências
router.get(
    '/',
    PreferenciaController.listar
);

// Listar preferências por grupo
router.get(
    '/grupo/:grupo',
    PreferenciaController.listarPorGrupo
);

// Buscar preferência por grupo e código
router.get(
    '/:grupo/:codigo',
    validarBuscaPorCodigo,
    PreferenciaController.buscarPorCodigo
);

// Criar preferência
router.post(
    '/',
    validarCriacaoPreferencia,
    PreferenciaController.criar
);

module.exports = router;
