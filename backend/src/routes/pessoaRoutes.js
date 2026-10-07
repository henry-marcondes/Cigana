const express = require('express');
const PessoaController = require('../controllers/PessoaController');
const autenticar = require('../middleware/autenticar');
const { validarPessoa } = require('../validators/PessoaValidator');

const router = express.Router();

router.get(
    '/minha',
    autenticar,
    PessoaController.buscarMinhaPessoa
);

router.post(
    '/',
    autenticar,
    validarPessoa,
    PessoaController.criar
);

router.put(
    '/minha',
    autenticar,
    validarPessoa,
    PessoaController.atualizar
);

module.exports = router;
