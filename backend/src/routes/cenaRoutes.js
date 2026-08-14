const express = require('express');

const router = express.Router();

const CenaController = require('../controllers/CenaController');

const {
    validarCriacaoCena,
    validarAlteracaoCena,
    validarIdCena,
    validarCapituloCena,
    validarSlugCena
} = require('../validators/cenaValidator');


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


// =====================================================
// CRIAR CENA
// POST /api/cenas
// =====================================================

router.post(
    '/',
    validarCriacaoCena,
    CenaController.criar
);


// =====================================================
// ALTERAR INFORMAÇÕES DA CENA
// PUT /api/cenas/:id
// =====================================================

router.put(
    '/:id',
    validarAlteracaoCena,
    CenaController.alterarInformacoes
);


// =====================================================
// DEFINIR CENA INICIAL
// PATCH /api/cenas/:id/inicial
// =====================================================

router.patch(
    '/:id/inicial',
    validarIdCena,
    CenaController.definirCenaInicial
);


// =====================================================
// DESATIVAR CENA
// DELETE /api/cenas/:id
// =====================================================

router.delete(
    '/:id',
    validarIdCena,
    CenaController.desativar
);


module.exports = router;
