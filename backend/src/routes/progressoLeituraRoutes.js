const express = require('express');

const router = express.Router();

const ProgressoLeituraController =
    require('../controllers/ProgressoLeituraController');

const {
    validarUsuarioId,
    validarId,
    validarUsuarioELivro,
    validarCriacao,
    validarAtualizacaoCenaAtual,
    validarAtualizacaoPercentual,
    validarConclusao,
    validarDesativacao
} = require('../validators/progressoLeituraValidator');


// Listar progressos de um usuário
router.get(
    '/usuario/:usuario_id',
    validarUsuarioId,
    ProgressoLeituraController.listarPorUsuario
);


// Buscar progresso por usuário e livro
router.get(
    '/usuario/:usuario_id/livro/:livro_id',
    validarUsuarioELivro,
    ProgressoLeituraController.buscarPorUsuarioELivro
);


// Buscar progresso por ID
router.get(
    '/:id',
    validarId,
    ProgressoLeituraController.buscarPorId
);


// Criar progresso
router.post(
    '/',
    validarCriacao,
    ProgressoLeituraController.criar
);


// Atualizar cena atual
router.patch(
    '/:id/cena',
    validarAtualizacaoCenaAtual,
    ProgressoLeituraController.atualizarCenaAtual
);


// Atualizar percentual
router.patch(
    '/:id/percentual',
    validarAtualizacaoPercentual,
    ProgressoLeituraController.atualizarPercentual
);


// Concluir leitura
router.patch(
    '/:id/concluir',
    validarConclusao,
    ProgressoLeituraController.concluirLeitura
);


// Desativar progresso
router.delete(
    '/:id',
    validarDesativacao,
    ProgressoLeituraController.desativar
);


module.exports = router;
