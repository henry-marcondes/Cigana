
const express = require('express');

const CenaAudioController =
require('../controllers/CenaAudioController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const autorizarObra = require('../middleware/autorizarObra');

const EscopoObraService =
require('../services/escopoObraService');

const {
validarCenaId,
validarCriacao,
validarAlteracaoInformacoes,
validarAlteracaoAudio,
validarDesativacao
} = require('../validators/cenaAudioValidator');

const router = express.Router();

router.get(
'/cena/:cena_id',
validarCenaId,
CenaAudioController.listarPorCena
);

router.get(
'/:id',
validarDesativacao,
CenaAudioController.buscarPorId
);

router.post(
'/',
autenticar,
autorizarObra(
EscopoObraService.porCenaAudioBody
),
validarCriacao,
CenaAudioController.criar
);

router.patch(
'/:id',
autenticar,
autorizarObra(
EscopoObraService.porCenaAudioParam
),
validarAlteracaoInformacoes,
CenaAudioController.alterarInformacoes
);

router.patch(
'/:id/audio',
autenticar,
autorizarObra(
EscopoObraService.porCenaAudioParam
),
validarAlteracaoAudio,
CenaAudioController.alterarAudio
);

router.delete(
'/:id',
autenticar,
autorizarObra(
EscopoObraService.porCenaAudioParam
),
autorizar('obra.excluir'),
validarDesativacao,
CenaAudioController.desativar
);

module.exports = router;
