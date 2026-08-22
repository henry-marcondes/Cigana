const express = require('express');

const router = express.Router();

const TokenUsuarioController = require('../controllers/TokenUsuarioController');

const {
    validarCriacaoToken,
    validarValidacaoToken,
    validarInvalidacaoToken
} = require('../validators/tokenUsuarioValidator');

// Criar token
router.post(
    '/',
    validarCriacaoToken,
    TokenUsuarioController.criar
);

// Validar token
router.post(
    '/validar',
    validarValidacaoToken,
    TokenUsuarioController.validar
);

// Invalidar token
router.patch(
    '/invalidar',
    validarInvalidacaoToken,
    TokenUsuarioController.invalidar
);

module.exports = router;
