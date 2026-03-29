const pool = require('../db/connection');

class Book {
  static async getAll() {
    const result = await pool.query('SELECT * FROM books');
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { title, description } = data;
    const result = await pool.query(
      'INSERT INTO books (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { title, description } = data;
    const result = await pool.query(
      'UPDATE books SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = Book;
