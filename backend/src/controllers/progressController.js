const UserProgress = require('../models/UserProgress');

exports.get = async (req, res, next) => {
  try {
    const { userId, bookId } = req.params;
    const progress = await UserProgress.get(userId, bookId);
    
    if (!progress) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }
    
    res.json(progress);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const progress = await UserProgress.create(req.body);
    res.status(201).json(progress);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { userId, bookId } = req.params;
    const { currentChapterId } = req.body;
    
    const progress = await UserProgress.update(userId, bookId, currentChapterId);
    
    if (!progress) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }
    
    res.json(progress);
  } catch (error) {
    next(error);
  }
};
