const express = require('express');

const EscolhaController = require('../controllers/EscolhaController');

const {
    validarCriacaoEscolha,
    validarAlteracaoTexto,
    validarAlteracaoDestino,
    validarAlteracaoOrdemExibicao,
    validarBuscaPorId,
    validarListagemPorCenaOrigem,
    validarDesativacao
} = require('../validators/escolhaValidator');

const router = express.Router();

// Listar escolhas de uma cena de origem
router.get(
    '/cena/:cena_origem_id',
    validarListagemPorCenaOrigem,
    EscolhaController.listarPorCenaOrigem
);

// Buscar escolha por ID
router.get(
    '/:id',
    validarBuscaPorId,
    EscolhaController.buscarPorId
);

// Criar escolha
router.post(
    '/',
    validarCriacaoEscolha,
    EscolhaController.criar
);

// Alterar texto da escolha
router.patch(
    '/:id/texto',
    validarAlteracaoTexto,
    EscolhaController.alterarTexto
);

// Alterar destino da escolha
router.patch(
    '/:id/destino',
    validarAlteracaoDestino,
    EscolhaController.alterarDestino
);

// Alterar ordem de exibição
router.patch(
    '/:id/ordem',
    validarAlteracaoOrdemExibicao,
    EscolhaController.alterarOrdemExibicao
);

// Desativar escolha
router.delete(
    '/:id',
    validarDesativacao,
    EscolhaController.desativar
);

module.exports = router;
