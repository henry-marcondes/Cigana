const express = require('express');
const chapterController = require('../controllers/chapterController');

const router = express.Router();

router.get('/book/:bookId', chapterController.getByBookId);

router.get('/:id/choices', chapterController.getChoices);
router.get('/:id', chapterController.getById);

router.post('/', chapterController.create);

module.exports = router;
