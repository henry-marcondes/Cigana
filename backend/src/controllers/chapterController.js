const Chapter = require('../models/Chapter');

exports.getByBookId = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const chapters = await Chapter.getByBookId(bookId);
    res.json(chapters);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.getById(id);
    
    if (!chapter) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }

    // Obter as escolhas relacionadas
    const choices = await Chapter.getChoices(id);
    
    res.json({ ...chapter, choices });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const chapter = await Chapter.create(req.body);
    res.status(201).json(chapter);
  } catch (error) {
    next(error);
  }
};

const db = require('../db/connection');

exports.getChoices = async (req, res, next) => {
  try {
    const chapterId = req.params.id;

    const result = await db.query(
      'SELECT id, choice_text, next_chapter_id FROM choices WHERE chapter_id = $1',
      [chapterId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
