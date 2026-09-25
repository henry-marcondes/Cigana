const express = require('express');
const ContratoController = require('../controllers/ContratoController');
const ContratoValidator = require('../validators/ContratoValidator');

const router = express.Router();

router.get(
    '/',
    ContratoController.listar
);

router.get(
    '/codigo/:codigo',
    ContratoValidator.validarCodigo,
    ContratoController.buscarPorCodigo
);

router.get(
    '/:id/versoes',
    ContratoValidator.validarId,
    ContratoController.listarVersoes
);

router.get(
    '/:id/versao-ativa',
    ContratoValidator.validarId,
    ContratoController.buscarVersaoAtiva
);

router.get(
    '/versoes/:id',
    ContratoValidator.validarId,
    ContratoController.buscarVersaoPorId
);

router.get(
    '/obra/:livro_id',
    ContratoValidator.validarLivroId,
    ContratoController.listarContratosPorObra
);

router.get(
    '/vinculos/:id',
    ContratoValidator.validarId,
    ContratoController.buscarContratoObraPorId
);

router.post(
    '/vincular-obra',
    ContratoValidator.validarVinculoContratoObra,
    ContratoController.vincularObra
);

router.get(
    '/:id/obras',
    ContratoValidator.validarId,
    ContratoController.listarObrasPorContrato
);

router.get(
    '/:id',
    ContratoValidator.validarId,
    ContratoController.buscarPorId
);

module.exports = router;
