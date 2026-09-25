const express = require('express');
const ContratoAceiteController = require('../controllers/ContratoAceiteController');
const ContratoAceiteValidator = require('../validators/ContratoAceiteValidator');

const router = express.Router();

router.get(
    '/versao/:contrato_versao_id',
    ContratoAceiteValidator.validarContratoVersaoId,
    ContratoAceiteController.listarPorVersao
);

router.get(
    '/usuario/:usuario_id',
    ContratoAceiteValidator.validarUsuarioId,
    ContratoAceiteController.listarPorUsuario
);

router.get(
    '/versao/:contrato_versao_id/usuario/:usuario_id',
    ContratoAceiteValidator.validarVersaoEUsuario,
    ContratoAceiteController.buscarPorVersaoEUsuario
);

router.get(
    '/:id',
    ContratoAceiteValidator.validarId,
    ContratoAceiteController.buscarPorId
);

router.post(
    '/',
    ContratoAceiteValidator.validarCriacao,
    ContratoAceiteController.criar
);

module.exports = router;
