const express = require('express');
const PessoaController = require('../controllers/PessoaController');
const autenticar = require('../middleware/autenticar');
const {
    validarCriacaoPessoa,
    validarAtualizacaoPessoa
} = require('../validators/PessoaValidator');

const router = express.Router();

router.get(
    '/minha/regularizacao',
    autenticar,
    PessoaController.verificarRegularizacao
);

router.get(
    '/minha',
    autenticar,
    PessoaController.buscarMinhaPessoa
);

router.post(
    '/',
    autenticar,
    validarCriacaoPessoa,
    PessoaController.criar
);

router.put(
    '/minha',
    autenticar,
    validarAtualizacaoPessoa,
    PessoaController.atualizar
);

module.exports = router;
