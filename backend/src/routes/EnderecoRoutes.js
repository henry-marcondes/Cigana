const express = require('express');

const EnderecoController = require('../controllers/EnderecoController');
const autenticar = require('../middleware/autenticar');
const {
    validarCriacao,
    validarAtualizacao,
    validarPrincipal
} = require('../validators/EnderecoValidator');

const router = express.Router();

router.get(
    '/minha',
    autenticar,
    EnderecoController.listarMeusEnderecos
);

router.get(
    '/:id',
    autenticar,
    EnderecoController.buscarMeuEndereco
);

router.post(
    '/',
    autenticar,
    validarCriacao,
    EnderecoController.criar
);

router.put(
    '/:id',
    autenticar,
    validarAtualizacao,
    EnderecoController.atualizar
);

router.patch(
    '/:id/principal',
    autenticar,
    validarPrincipal,
    EnderecoController.definirPrincipal
);

router.delete(
    '/:id',
    autenticar,
    EnderecoController.desativar
);

module.exports = router;
