const express = require('express');

const router = express.Router();

const CenaVideoController =
    require('../controllers/CenaVideoController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');

const {
    validarCenaId,
    validarCriacao,
    validarAlteracaoInformacoes,
    validarAlteracaoVideo,
    validarDesativacao
} = require('../validators/cenaVideoValidator');

// Listar vídeos de uma cena
router.get(
    '/cena/:cena_id',
    validarCenaId,
    CenaVideoController.listarPorCena
);

// Buscar vídeo por ID
router.get(
    '/:id',
    CenaVideoController.buscarPorId
);

// Criar vídeo
router.post(
    '/',
    autenticar,
    autorizar('obra.editar'),
    validarCriacao,
    CenaVideoController.criar
);

// Alterar informações do vídeo
router.patch(
    '/:id/informacoes',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoInformacoes,
    CenaVideoController.alterarInformacoes
);

// Alterar URL do vídeo
router.patch(
    '/:id/video',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoVideo,
    CenaVideoController.alterarVideo
);

// Desativar vídeo
router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    validarDesativacao,
    CenaVideoController.desativar
);

module.exports = router;
