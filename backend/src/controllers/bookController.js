const Book = require('../models/Book');

exports.getAll = async (req, res, next) => {
  try {
    const books = await Book.getAll();
    res.json(books);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.getById(id);
    
    if (!book) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    
    res.json(book);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.update(id, req.body);
    
    if (!book) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    
    res.json(book);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.delete(id);
    
    if (!book) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    
    res.json({ message: 'Livro deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};
