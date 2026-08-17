const express = require('express');

const MarcadorController = require('../controllers/MarcadorController');

const {
    validarId,
    validarCriacaoMarcador,
    validarAlteracaoInformacoes,
    validarAlteracaoCena
} = require('../validators/marcadorValidator');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Listar marcadores por usuário
|--------------------------------------------------------------------------
*/
router.get(
    '/usuario/:usuario_id',
    MarcadorController.listarPorUsuario
);

/*
|--------------------------------------------------------------------------
| Listar marcadores de um livro por usuário
|--------------------------------------------------------------------------
*/
router.get(
    '/usuario/:usuario_id/livro/:livro_id',
    MarcadorController.listarPorLivro
);

/*
|--------------------------------------------------------------------------
| Buscar marcador por ID
|--------------------------------------------------------------------------
*/
router.get(
    '/:id',
    validarId,
    MarcadorController.buscarPorId
);

/*
|--------------------------------------------------------------------------
| Criar marcador
|--------------------------------------------------------------------------
*/
router.post(
    '/',
    validarCriacaoMarcador,
    MarcadorController.criar
);

/*
|--------------------------------------------------------------------------
| Alterar informações do marcador
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id',
    validarAlteracaoInformacoes,
    MarcadorController.alterarInformacoes
);

/*
|--------------------------------------------------------------------------
| Alterar cena do marcador
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id/cena',
    validarAlteracaoCena,
    MarcadorController.alterarCena
);

/*
|--------------------------------------------------------------------------
| Desativar marcador
|--------------------------------------------------------------------------
*/
router.patch(
    '/:id/desativar',
    validarId,
    MarcadorController.desativar
);

module.exports = router;
