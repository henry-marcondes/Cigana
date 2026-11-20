const express = require('express');
const NavegacaoEstruturalController = require('../controllers/NavegacaoEstruturalController');
const autenticar = require('../middleware/autenticar');
const autorizarObra = require('../middleware/autorizarObra');
const protegerLeituraObra = require('../middleware/protegerLeituraObra');
const EscopoObraService = require('../services/escopoObraService');
const {
    validarListagem,
    validarBusca,
    validarCriacao,
    validarAlteracao,
    validarReordenacao,
    validarDesativacao,
} = require('../validators/navegacaoEstruturalValidator');

const router = express.Router();

router.get(
    '/cena/:cena_origem_id',
    protegerLeituraObra(
        EscopoObraService.comParametro(
            EscopoObraService.porCenaParam,
            'cena_origem_id'
        )
    ),
    validarListagem,
    NavegacaoEstruturalController.listarPorCenaOrigem
);

router.get(
    '/:id',
    protegerLeituraObra(EscopoObraService.porNavegacaoEstruturalParam),
    validarBusca,
    NavegacaoEstruturalController.buscarPorId
);

router.post(
    '/',
    autenticar,
    autorizarObra(EscopoObraService.porNavegacaoEstruturalCenaOrigemBody, 'obra.editar'),
    validarCriacao,
    NavegacaoEstruturalController.criar
);

router.patch(
    '/reordenar',
    autenticar,
    autorizarObra(EscopoObraService.porNavegacaoEstruturalCenaOrigemBody, 'obra.editar'),
    validarReordenacao,
    NavegacaoEstruturalController.reordenar
);

router.put(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porNavegacaoEstruturalParam, 'obra.editar'),
    validarAlteracao,
    NavegacaoEstruturalController.alterar
);

router.delete(
    '/:id',
    autenticar,
    autorizarObra(EscopoObraService.porNavegacaoEstruturalParam, 'obra.excluir'),
    validarDesativacao,
    NavegacaoEstruturalController.desativar
);

module.exports = router;
