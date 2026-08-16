const express = require('express');

const CenaVideoController =
    require('../controllers/CenaVideoController');

const {
    validarCenaId,
    validarCriacao,
    validarAlteracaoInformacoes,
    validarAlteracaoVideo,
    validarDesativacao
} = require('../validators/cenaVideoValidator');

const router = express.Router();

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
    validarCriacao,
    CenaVideoController.criar
);


// Alterar informações do vídeo
router.patch(
    '/:id/informacoes',
    validarAlteracaoInformacoes,
    CenaVideoController.alterarInformacoes
);


// Alterar URL do vídeo
router.patch(
    '/:id/video',
    validarAlteracaoVideo,
    CenaVideoController.alterarVideo
);


// Desativar vídeo
router.delete(
    '/:id',
    validarDesativacao,
    CenaVideoController.desativar
);


module.exports = router;
