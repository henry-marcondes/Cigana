const express = require('express');

const CenaAudioController =
    require('../controllers/CenaAudioController');

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
    validarCriacao,
    CenaAudioController.criar
);


router.patch(
    '/:id',
    validarAlteracaoInformacoes,
    CenaAudioController.alterarInformacoes
);


router.patch(
    '/:id/audio',
    validarAlteracaoAudio,
    CenaAudioController.alterarAudio
);


router.delete(
    '/:id',
    validarDesativacao,
    CenaAudioController.desativar
);


module.exports = router;
