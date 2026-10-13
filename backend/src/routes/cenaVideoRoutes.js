
const express = require('express');

const router = express.Router();

const CenaVideoController = require('../controllers/CenaVideoController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');
const protegerLeituraObra = require('../middleware/protegerLeituraObra');

const EscopoObraService =
require('../services/escopoObraService');

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
protegerLeituraObra(
EscopoObraService.comParametro(
EscopoObraService.porCenaParam,
'cena_id'
)
),
validarCenaId,
CenaVideoController.listarPorCena
);

// Buscar vídeo por ID
router.get(
'/:id',
protegerLeituraObra(EscopoObraService.porCenaVideoParam),
CenaVideoController.buscarPorId
);

// Criar vídeo
router.post(
'/',
autenticar,
autorizarObra(
EscopoObraService.porCenaVideoBody
),
validarCriacao,
CenaVideoController.criar
);

// Alterar informações do vídeo
router.patch(
'/:id/informacoes',
autenticar,
autorizarObra(
EscopoObraService.porCenaVideoParam
),
validarAlteracaoInformacoes,
CenaVideoController.alterarInformacoes
);

// Alterar URL do vídeo
router.patch(
'/:id/video',
autenticar,
autorizarObra(
EscopoObraService.porCenaVideoParam
),
validarAlteracaoVideo,
CenaVideoController.alterarVideo
);

// Desativar vídeo
router.delete(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porCenaVideoParam),
    validarDesativacao,
    CenaVideoController.desativar
);
module.exports = router;
