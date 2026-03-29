const pool = require('../db/connection');

class UserProgress {
  static async get(userId, bookId) {
    const result = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { user_id, book_id, current_chapter_id } = data;
    const result = await pool.query(
      `INSERT INTO user_progress (user_id, book_id, current_chapter_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, book_id, current_chapter_id]
    );
    return result.rows[0];
  }

  static async update(userId, bookId, currentChapterId) {
    const result = await pool.query(
      `UPDATE user_progress 
       SET current_chapter_id = $1, updated_at = NOW() 
       WHERE user_id = $2 AND book_id = $3 
       RETURNING *`,
      [currentChapterId, userId, bookId]
    );
    return result.rows[0];
  }
}

module.exports = UserProgress;
