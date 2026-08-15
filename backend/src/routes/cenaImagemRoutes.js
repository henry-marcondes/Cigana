const express = require('express');

const CenaImagemController = require('../controllers/CenaImagemController');

const {
    validarCriacaoCenaImagem,
    validarAlteracaoInformacoes,
    validarAlteracaoImagem,
    validarBuscaPorId,
    validarListagemPorCena,
    validarDesativacao
} = require('../validators/cenaImagemValidator');

const router = express.Router();

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
    validarCriacaoCenaImagem,
    CenaImagemController.criar
);

// Alterar informações da imagem
router.patch(
    '/:id/informacoes',
    validarAlteracaoInformacoes,
    CenaImagemController.alterarInformacoes
);

// Alterar URL da imagem
router.patch(
    '/:id/imagem',
    validarAlteracaoImagem,
    CenaImagemController.alterarImagem
);

// Desativar imagem
router.delete(
    '/:id',
    validarDesativacao,
    CenaImagemController.desativar
);

module.exports = router;
