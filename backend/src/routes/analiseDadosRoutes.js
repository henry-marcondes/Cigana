const express = require('express');
const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const AnaliseDadosController = require('../controllers/AnaliseDadosController');
const {
    validarConsultaAvaliacoesComentarios
} = require('../validators/analiseDadosValidator');

const router = express.Router();

router.use(
    autenticar,
    autorizar('analise_dados.visualizar')
);

router.get(
    '/avaliacoes-comentarios',
    validarConsultaAvaliacoesComentarios,
    AnaliseDadosController.obterIndicadoresAvaliacoesComentarios
);

router.get(
    '/progresso-leitura',
    AnaliseDadosController.obterIndicadoresProgressoLeitura
);

module.exports = router;
