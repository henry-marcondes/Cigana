const pool = require('../db/connection');

class Chapter {
static async getByBookId(bookId) {
  const result = await pool.query(
    'SELECT * FROM chapters WHERE book_id = $1 ORDER BY id',
    [bookId]
  );
  return result.rows;
}
  static async getById(id) {
    const result = await pool.query('SELECT * FROM chapters WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { book_id, chapter_number, title, text_content, image_url, video_url, order_position } = data;
    const result = await pool.query(
      `INSERT INTO chapters (book_id, chapter_number, title, text_content, image_url, video_url, order_position) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [book_id, chapter_number, title, text_content, image_url, video_url, order_position]
    );
    return result.rows[0];
  }
static async getChoices(chapterId) {
  const result = await pool.query(
    'SELECT * FROM choices WHERE chapter_id = $1 ORDER BY id',
    [chapterId]
  );
  return result.rows;
 }
}

module.exports = Chapter;
