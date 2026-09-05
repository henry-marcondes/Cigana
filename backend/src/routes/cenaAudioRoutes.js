const express = require('express');

const CenaAudioController =
    require('../controllers/CenaAudioController');

const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');

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
    autorizar('obra.editar'),
    validarCriacao,
    CenaAudioController.criar
);


router.patch(
    '/:id',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoInformacoes,
    CenaAudioController.alterarInformacoes
);


router.patch(
    '/:id/audio',
    autenticar,
    autorizar('obra.editar'),
    validarAlteracaoAudio,
    CenaAudioController.alterarAudio
);


router.delete(
    '/:id',
    autenticar,
    autorizar('obra.excluir'),
    validarDesativacao,
    CenaAudioController.desativar
);


module.exports = router;
