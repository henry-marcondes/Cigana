const express = require('express');

const router = express.Router();

const CenaTextoController = require('../controllers/cenaTextoController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');
const EscopoObraService = require('../services/escopoObraService');

const {
    validarCriacaoCenaTexto,
    validarAlteracaoCenaTexto,
    validarIdCenaTexto,
    validarIdCena
} = require('../validators/cenaTextoValidator');

router.get(
    '/cena/:cena_id',
    validarIdCena,
    CenaTextoController.listarPorCena
);

router.get(
    '/:id',
    validarIdCenaTexto,
    CenaTextoController.buscarPorId
);

router.post(
    '/',
    autenticar,
    autorizarObra(EscopoObraService.porCenaBody),
    validarCriacaoCenaTexto,
    CenaTextoController.criar
);

router.patch(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porCenaTextoParam),
    validarAlteracaoCenaTexto,
    CenaTextoController.alterar
);
router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    validarIdCenaTexto,
    CenaTextoController.desativar
);

module.exports = router;
