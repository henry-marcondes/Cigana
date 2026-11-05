const express = require('express');
const Controller = require('../controllers/SolicitacaoInclusaoObraController');
const autenticar = require('../middleware/autenticar');
const autorizar = require('../middleware/autorizacao');
const Validator = require('../validators/solicitacaoInclusaoObraValidator');

const router = express.Router();
router.use(autenticar);
const exigirAutor = autorizar('obra.criar');

router.post('/', exigirAutor, Validator.validarProposta, Controller.criar);
router.get('/minhas', exigirAutor, Controller.listarMinhas);
router.get('/gestao', autorizar('obra.aprovar'), Controller.listarGestao);
router.get('/gestao/:id', autorizar('obra.aprovar'), Validator.validarId, Controller.buscarGestao);
router.patch('/gestao/:id/aprovar', autorizar('obra.aprovar'), Validator.validarId, Controller.aprovar);
router.patch('/gestao/:id/rejeitar', autorizar('obra.aprovar'), Validator.validarId, Validator.validarRejeicao, Controller.rejeitar);
router.get('/:id', exigirAutor, Validator.validarId, Controller.buscarMinha);
router.put('/:id', exigirAutor, Validator.validarId, Validator.validarProposta, Controller.editar);
router.post('/:id/reenviar', exigirAutor, Validator.validarId, Controller.reenviar);
module.exports = router;
