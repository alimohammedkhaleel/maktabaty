const pool = require('../config/db');

// ─── Get All Books ────────────────────────────────────────────────────────────
exports.getAllBooks = async (req, res) => {
  try {
    const { rows: books } = await pool.query(
      `SELECT b.*, u.username AS author_name
       FROM books b
       LEFT JOIN users u ON b.created_by = u.id
       ORDER BY b.created_at DESC`
    );

    return res.status(200).json({ success: true, count: books.length, books });
  } catch (error) {
    console.error('Get books error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Get Single Book ──────────────────────────────────────────────────────────
exports.getBook = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: books } = await pool.query(
      `SELECT b.*, u.username AS author_name
       FROM books b
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    return res.status(200).json({ success: true, book: books[0] });
  } catch (error) {
    console.error('Get book error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Add Book ─────────────────────────────────────────────────────────────────
exports.addBook = async (req, res) => {
  try {
    let file_url = req.body.file_url || null;
    let file_name = req.body.file_name || null;

    if (req.file) {
      file_name = req.file.filename;
      file_url = `/uploads/${req.file.filename}`;
    }

    const { title, author, description, category, published_year, pages, cover_url } = req.body;

    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and author are required' });
    }

    const { rows: [book] } = await pool.query(
      `INSERT INTO books
         (title, author, description, category, published_year, pages, file_url, file_name, cover_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [title, author, description, category, published_year || null, pages || null, file_url, file_name, cover_url, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book: { id: book.id, title, author, description, category, published_year, pages, file_url, file_name, cover_url }
    });
  } catch (error) {
    console.error('Add book error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Update Book ──────────────────────────────────────────────────────────────
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, category, published_year, pages, cover_url } = req.body;

    const { rows: books } = await pool.query(
      'SELECT * FROM books WHERE id = $1',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (books[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this book' });
    }

    await pool.query(
      `UPDATE books
       SET title = $1, author = $2, description = $3, category = $4,
           published_year = $5, pages = $6, cover_url = $7
       WHERE id = $8`,
      [
        title || books[0].title,
        author || books[0].author,
        description,
        category,
        published_year || null,
        pages || null,
        cover_url,
        id
      ]
    );

    return res.status(200).json({ success: true, message: 'Book updated successfully' });
  } catch (error) {
    console.error('Update book error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Delete Book ──────────────────────────────────────────────────────────────
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: books } = await pool.query(
      'SELECT * FROM books WHERE id = $1',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (books[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this book' });
    }

    await pool.query('DELETE FROM books WHERE id = $1', [id]);

    return res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Search Books ─────────────────────────────────────────────────────────────
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchPattern = `%${query}%`;

    const { rows: books } = await pool.query(
      `SELECT b.*, u.username AS author_name
       FROM books b
       LEFT JOIN users u ON b.created_by = u.id
       WHERE b.title ILIKE $1
          OR b.author ILIKE $1
          OR b.description ILIKE $1
          OR b.category ILIKE $1
       ORDER BY b.created_at DESC`,
      [searchPattern]
    );

    return res.status(200).json({ success: true, count: books.length, books });
  } catch (error) {
    console.error('Search books error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Add to Favorites ─────────────────────────────────────────────────────────
exports.addToFavorites = async (req, res) => {
  try {
    const { book_id } = req.body;

    const { rows: books } = await pool.query(
      'SELECT id FROM books WHERE id = $1',
      [book_id]
    );
    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // PostgreSQL equivalent of INSERT IGNORE
    await pool.query(
      'INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) ON CONFLICT (user_id, book_id) DO NOTHING',
      [req.user.id, book_id]
    );

    return res.status(201).json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Add to favorites error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Remove from Favorites ────────────────────────────────────────────────────
exports.removeFromFavorites = async (req, res) => {
  try {
    const { book_id } = req.params;

    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND book_id = $2',
      [req.user.id, book_id]
    );

    return res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Get User Favorites ───────────────────────────────────────────────────────
exports.getFavorites = async (req, res) => {
  try {
    const { rows: books } = await pool.query(
      `SELECT b.*, u.username AS author_name
       FROM favorites f
       JOIN books b ON f.book_id = b.id
       LEFT JOIN users u ON b.created_by = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, count: books.length, books });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
