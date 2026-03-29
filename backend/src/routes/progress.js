const express = require('express');
const progressController = require('../controllers/progressController');

const router = express.Router();

router.get('/:userId/:bookId', progressController.get);
router.post('/', progressController.create);
router.put('/:userId/:bookId', progressController.update);

module.exports = router;
