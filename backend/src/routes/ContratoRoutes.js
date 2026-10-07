const express = require('express');

const ContratoController = require('../controllers/ContratoController');
const autenticar = require('../middleware/autenticar');

const router = express.Router();

// =====================================================
// CONTRATOS
// =====================================================

router.get('/', ContratoController.listar);

router.get(
    '/codigo/:codigo',
    ContratoController.buscarPorCodigo
);

router.get(
    '/:id',
    ContratoController.buscarPorId
);

router.post(
    '/',
    ContratoController.criar
);

router.put(
    '/:id',
    ContratoController.atualizar
);

router.patch(
    '/:id/ativar',
    ContratoController.ativar
);

router.patch(
    '/:id/desativar',
    ContratoController.desativar
);

// =====================================================
// VERSÕES
// =====================================================

router.get(
    '/:contratoId/versoes',
    ContratoController.listarVersoes
);

router.get(
    '/:contratoId/versao-ativa',
    ContratoController.buscarVersaoAtiva
);

router.post(
    '/:contratoId/versoes',
    ContratoController.criarVersao
);

router.get(
    '/versoes/:id',
    ContratoController.buscarVersaoPorId
);

router.put(
    '/versoes/:id',
    ContratoController.atualizarVersao
);

router.patch(
    '/versoes/:id/publicar',
    ContratoController.publicarVersao
);

router.patch(
    '/versoes/:id/encerrar',
    ContratoController.encerrarVersao
);

// =====================================================
// VÍNCULO COM OBRAS
// =====================================================

router.get(
    '/:contratoId/obras',
    ContratoController.listarObrasPorContrato
);

router.post(
    '/:contratoId/obras',
    ContratoController.vincularObra
);

router.get(
    '/obras/:livroId',
    ContratoController.listarContratosPorObra
);

router.get(
    '/obras/vinculos/:id',
    ContratoController.buscarContratoObraPorId
);

router.delete(
    '/obras/vinculos/:id',
    ContratoController.desvincularObra
);

// =====================================================
// ACEITES
// =====================================================

router.get(
    '/aceites/usuario/:usuarioId',
    ContratoController.listarAceitesPorUsuario
);

router.get(
    '/aceites/versao/:contratoVersaoId',
    ContratoController.listarAceitesPorVersao
);

router.get(
    '/aceites/:id',
    ContratoController.buscarAceitePorId
);

router.get(
    '/aceites/usuario/:usuarioId/versao/:contratoVersaoId',
    ContratoController.verificarAceite
);

// O aceite usa o usuário autenticado.
// Não recebe usuario_id no body.
router.post(
    '/versoes/:contratoVersaoId/aceite',
    autenticar,
    ContratoController.registrarAceite
);

module.exports = router;
