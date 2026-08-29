const express = require('express');

const router = express.Router();

const CenaTextoController = require('../controllers/cenaTextoController');

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
    validarCriacaoCenaTexto,
    CenaTextoController.criar
);

router.patch(
    '/:id',
    validarAlteracaoCenaTexto,
    CenaTextoController.alterar
);

router.delete(
    '/:id',
    validarIdCenaTexto,
    CenaTextoController.desativar
);

module.exports = router;
