const express = require('express');
const EscolhaController = require('../controllers/EscolhaController');
const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');
const EscopoObraService = require('../services/escopoObraService');

const {
    validarCriacaoEscolha,
    validarAlteracaoTexto,
    validarAlteracaoDestino,
    validarAlteracaoOrdemExibicao,
    validarBuscaPorId,
    validarListagemPorCenaOrigem,
    validarReordenacao,
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
    autorizarObra(
        EscopoObraService.porEscolhaCenaOrigemBody,
        'obra.editar'
    ),
    validarCriacaoEscolha,
    EscolhaController.criar
);

//reordenar ordem de exibição
router.patch(
    '/reordenar',
    autenticar,
    autorizarObra(
        EscopoObraService.porEscolhaCenaOrigemBody
    ),
    validarReordenacao,
    EscolhaController.reordenar
);

// Alterar texto da escolha
router.patch(
    '/:id/texto',
    autenticar,
    autorizarObra(EscopoObraService.porEscolhaParam),
    validarAlteracaoTexto,
    EscolhaController.alterarTexto
);

// Alterar destino da escolha
router.patch(
    '/:id/destino',
    autenticar,
    autorizarObra(EscopoObraService.porEscolhaParam),
    validarAlteracaoDestino,
    EscolhaController.alterarDestino
);

// Alterar ordem de exibição
router.patch(
    '/:id/ordem',
    autenticar,
    autorizarObra(EscopoObraService.porEscolhaParam),
    validarAlteracaoOrdemExibicao,
    EscolhaController.alterarOrdemExibicao
);


// Desativar escolha
router.delete(
    '/:id',
    autenticar,
    autorizarObra(
        EscopoObraService.porEscolhaParam,
        'obra.excluir'
    ),
    validarDesativacao,
    EscolhaController.desativar
);

module.exports = router;
