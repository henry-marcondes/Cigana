const express = require('express');

const router = express.Router();

const CenaTextoController = require('../controllers/cenaTextoController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');
const protegerLeituraObra = require('../middleware/protegerLeituraObra');
const EscopoObraService = require('../services/escopoObraService');

const {
    validarCriacaoCenaTexto,
    validarAlteracaoCenaTexto,
    validarIdCenaTexto,
    validarIdCena
} = require('../validators/cenaTextoValidator');

router.get(
    '/cena/:cena_id',
    protegerLeituraObra(
        EscopoObraService.comParametro(
            EscopoObraService.porCenaParam,
            'cena_id'
        )
    ),
    validarIdCena,
    CenaTextoController.listarPorCena
);

router.get(
    '/:id',
    protegerLeituraObra(EscopoObraService.porCenaTextoParam),
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
    autorizarObra(EscopoObraService.porCenaTextoParam),
    validarIdCenaTexto,
    CenaTextoController.desativar
);
module.exports = router;
