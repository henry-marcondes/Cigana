const express = require('express');

const router = express.Router();

const CenaTextoController = require('../controllers/cenaTextoController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');

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
    autorizar('obra.editar'),
    validarCriacaoCenaTexto,
    CenaTextoController.criar
);

router.patch(
    '/:id',
    autenticar,
    autorizar('obra.editar'),
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
