const express = require('express');

const router = express.Router();

const CenaConteudoController = require('../controllers/cenaConteudoController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');

const EscopoObraService = require('../services/escopoObraService');

const {
    validarCriacaoCenaConteudo,
    validarAlteracaoOrdem,
    validarAlteracaoTipoConteudo,
    validarIdCenaConteudo,
    validarIdCena,
    validarReordenacao
} = require('../validators/cenaConteudoValidator');

// Listar conteúdos de uma cena
router.get(
    '/cena/:cena_id',
    validarIdCena,
    CenaConteudoController.listarPorCena
);

// Buscar conteúdo por ID
router.get(
    '/:id',
    validarIdCenaConteudo,
    CenaConteudoController.buscarPorId
);

// Criar conteúdo na cena
router.post(
    '/',
    autenticar,
    autorizarObra(EscopoObraService.porCenaConteudoBody),
    validarCriacaoCenaConteudo,
    CenaConteudoController.criar
);

// Reordenar conteúdos da cena
router.patch(
    '/reordenar',
    autenticar,
    autorizarObra(EscopoObraService.porCenaConteudoBody),
    validarReordenacao,
    CenaConteudoController.reordenar
);

// Alterar ordem
router.patch(
    '/:id/ordem',
    autenticar,
    autorizarObra(EscopoObraService.porCenaConteudoParam),
    validarAlteracaoOrdem,
    CenaConteudoController.alterarOrdem
);

// Alterar tipo de conteúdo
router.patch(
    '/:id/tipo',
    autenticar,
    autorizarObra(EscopoObraService.porCenaConteudoParam),
    validarAlteracaoTipoConteudo,
    CenaConteudoController.alterarTipoConteudo
);

// Desativar conteúdo
router.delete(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porCenaConteudoParam),
    validarIdCenaConteudo,
    CenaConteudoController.desativar
);

module.exports = router;
