const express = require('express');
const router = express.Router();
const CenaController = require('../controllers/CenaController');
const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');
const EscopoObraService = require('../services/escopoObraService');
const {
    validarCriacaoCena,
    validarAlteracaoCena,
    validarIdCena,
    validarCapituloCena,
    validarSlugCena
} = require('../validators/cenaValidator');

// =====================================================
// CENAS DE UM CAPÍTULO POR LIVRO EDITAR
// GET /api/cenas/capitulo/:capitulo_id
// =====================================================
router.post(
    '/',
    autenticar,
    autorizarObra(EscopoObraService.porCapituloBody),
    validarCriacaoCena,
    CenaController.criar
);

router.put(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porCenaParam),
    validarAlteracaoCena,
    CenaController.alterarInformacoes
);

router.patch(
    '/:id/inicial',
    autenticar,
    autorizarObra(EscopoObraService.porCenaParam),
    validarIdCena,
    CenaController.definirCenaInicial
);

router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    validarIdCena,
    CenaController.desativar
);


// =====================================================
// LISTAR CENAS DE UM CAPÍTULO
// GET /api/cenas/capitulo/:capitulo_id
// =====================================================
router.get(
    '/capitulo/:capitulo_id',
    validarCapituloCena,
    CenaController.listarPorCapitulo
);

// =====================================================
// BUSCAR CENA INICIAL DE UM CAPÍTULO
// GET /api/cenas/capitulo/:capitulo_id/inicial
// =====================================================
router.get(
    '/capitulo/:capitulo_id/inicial',
    validarCapituloCena,
    CenaController.buscarCenaInicial
);

// =====================================================
// BUSCAR CENA POR SLUG
// GET /api/cenas/capitulo/:capitulo_id/slug/:slug
// =====================================================
router.get(
    '/capitulo/:capitulo_id/slug/:slug',
    validarSlugCena,
    CenaController.buscarPorSlug
);

// =====================================================
// BUSCAR CENA POR ID
// GET /api/cenas/:id
// =====================================================
router.get(
    '/:id',
    validarIdCena,
    CenaController.buscarPorId
);

module.exports = router;
