const express = require('express');

const autenticar = require('../middleware/autenticar');
const TelefoneController = require('../controllers/TelefoneController');

const {
    validarCriacao,
    validarAtualizacao,
    validarPrincipal
} = require('../validators/TelefoneValidator');

const router = express.Router();

router.use(autenticar);

router.get(
    '/minha',
    TelefoneController.listarMeusTelefones
);

router.get(
    '/:id',
    TelefoneController.buscarMeuTelefone
);

router.post(
    '/',
    validarCriacao,
    TelefoneController.criar
);

router.put(
    '/:id',
    validarAtualizacao,
    TelefoneController.atualizar
);

router.patch(
    '/:id/principal',
    validarPrincipal,
    TelefoneController.definirPrincipal
);

router.delete(
    '/:id',
    TelefoneController.desativar
);

module.exports = router;
