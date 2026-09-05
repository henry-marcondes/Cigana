const express = require('express');

const router = express.Router();

const CenaImagemController = require('../controllers/CenaImagemController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');

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
    autorizar('obra.editar'),
    validarCriacaoCenaImagem,
    CenaImagemController.criar
);

// Alterar informações da imagem
router.patch(
    '/:id/informacoes',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoInformacoes,
    CenaImagemController.alterarInformacoes
);

// Alterar URL da imagem
router.patch(
    '/:id/imagem',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoImagem,
    CenaImagemController.alterarImagem
);

// Desativar imagem
router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    validarDesativacao,
    CenaImagemController.desativar
);

module.exports = router;
