const pool = require('../config/db');

// الحصول على جميع الكتب
exports.getAllBooks = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [books] = await connection.query(
      `SELECT b.*, u.username as author_name FROM books b
       LEFT JOIN users u ON b.created_by = u.id
       ORDER BY b.created_at DESC`
    );

    connection.release();

    return res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Get books error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// الحصول على كتاب واحد
exports.getBook = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [books] = await connection.query(
      `SELECT b.*, u.username as author_name FROM books b
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.id = ?`,
      [id]
    );

    connection.release();

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    return res.status(200).json({
      success: true,
      book: books[0]
    });
  } catch (error) {
    console.error('Get book error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// إضافة كتاب جديد
exports.addBook = async (req, res) => {
  try {
    // If uploaded file exists, use it; otherwise accept file_url/file_name from body
    let file_url = req.body.file_url || null;
    let file_name = req.body.file_name || null;

    if (req.file) {
      // store path relative to server root for serving via /uploads
      file_name = req.file.filename;
      file_url = `/uploads/${req.file.filename}`;
    }

    const { title, author, description, category, published_year, pages, cover_url } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title and author are required'
      });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO books (title, author, description, category, published_year, pages, file_url, file_name, cover_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, description, category, published_year, pages, file_url, file_name, cover_url, req.user.id]
    );

    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book: {
        id: result.insertId,
        title, author, description, category, published_year, pages, file_url, file_name, cover_url
      }
    });
  } catch (error) {
    console.error('Add book error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// تحديث الكتاب
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, category, published_year, pages, cover_url } = req.body;

    const connection = await pool.getConnection();

    // التحقق من أن المستخدم هو الذي أضاف الكتاب أو هو admin
    const [books] = await connection.query(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (books[0].created_by !== req.user.id && req.user.role !== 'admin') {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this book'
      });
    }

    await connection.query(
      `UPDATE books SET title = ?, author = ?, description = ?, category = ?, published_year = ?, pages = ?, cover_url = ?
       WHERE id = ?`,
      [title || books[0].title, author || books[0].author, description, category, published_year, pages, cover_url, id]
    );

    connection.release();

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Update book error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// حذف الكتاب
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    const [books] = await connection.query(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (books[0].created_by !== req.user.id && req.user.role !== 'admin') {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this book'
      });
    }

    await connection.query('DELETE FROM books WHERE id = ?', [id]);

    connection.release();

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// البحث عن الكتب
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const connection = await pool.getConnection();

    const [books] = await connection.query(
      `SELECT b.*, u.username as author_name FROM books b
       LEFT JOIN users u ON b.created_by = u.id
       WHERE MATCH(b.title, b.author, b.description) AGAINST(? IN BOOLEAN MODE)
       OR b.title LIKE ? OR b.author LIKE ?
       ORDER BY b.created_at DESC`,
      [query, `%${query}%`, `%${query}%`]
    );

    connection.release();

    return res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Search books error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// إضافة الكتاب للمفضلة
exports.addToFavorites = async (req, res) => {
  try {
    const { book_id } = req.body;

    const connection = await pool.getConnection();

    const [books] = await connection.query('SELECT * FROM books WHERE id = ?', [book_id]);
    if (books.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    await connection.query(
      'INSERT IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)',
      [req.user.id, book_id]
    );

    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// حذف من المفضلة
exports.removeFromFavorites = async (req, res) => {
  try {
    const { book_id } = req.params;

    const connection = await pool.getConnection();

    await connection.query(
      'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
      [req.user.id, book_id]
    );

    connection.release();

    return res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
