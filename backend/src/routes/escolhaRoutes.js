const express = require('express');

const EscolhaController = require('../controllers/EscolhaController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');

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
    autenticar,
    autorizar('obra.editar'),
    validarCriacaoEscolha,
    EscolhaController.criar
);

// Alterar texto da escolha
router.patch(
    '/:id/texto',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoTexto,
    EscolhaController.alterarTexto
);

// Alterar destino da escolha
router.patch(
    '/:id/destino',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoDestino,
    EscolhaController.alterarDestino
);

// Alterar ordem de exibição
router.patch(
    '/:id/ordem',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoOrdemExibicao,
    EscolhaController.alterarOrdemExibicao
);

// Desativar escolha
router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    validarDesativacao,
    EscolhaController.desativar
);

module.exports = router;
