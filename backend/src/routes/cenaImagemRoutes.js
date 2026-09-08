
const express = require('express');

const router = express.Router();

const CenaImagemController = require('../controllers/CenaImagemController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');
const EscopoObraService = require('../services/escopoObraService');

const {
    validarCriacaoCenaImagem,
    validarAlteracaoInformacoes,
    validarAlteracaoImagem,
    validarBuscaPorId,
    validarListagemPorCena,
    validarDesativacao
} = require('../validators/cenaImagemValidator');

// Listar imagens de uma cena
router.get(
    '/cena/:cena_id',
    validarListagemPorCena,
    CenaImagemController.listarPorCena
);

// Buscar imagem por ID
router.get(
    '/:id',
    validarBuscaPorId,
    CenaImagemController.buscarPorId
);

// Criar imagem da cena
router.post(
    '/',
    autenticar,
    autorizarObra(EscopoObraService.porCenaBody),
    validarCriacaoCenaImagem,
    CenaImagemController.criar
);

// Alterar informações da imagem
router.patch(
    '/:id/informacoes',
    autenticar,
    autorizarObra(EscopoObraService.porCenaImagemParam),
    validarAlteracaoInformacoes,
    CenaImagemController.alterarInformacoes
);

// Alterar URL da imagem
router.patch(
    '/:id/imagem',
    autenticar,
    autorizarObra(EscopoObraService.porCenaImagemParam),
    validarAlteracaoImagem,
    CenaImagemController.alterarImagem
);

// Desativar imagem
router.delete(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porCenaImagemParam),
    autorizar('obra.excluir'),
    validarDesativacao,
    CenaImagemController.desativar
);

module.exports = router;
