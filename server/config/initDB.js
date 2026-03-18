const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  try {
    // ✅ استخدام MYSQL_URL مباشرة
    const mysqlUrl = process.env.MYSQL_URL;
    
    if (!mysqlUrl) {
      throw new Error('MYSQL_URL is not defined in environment variables');
    }

    // الاتصال بقاعدة البيانات (MYSQL_URL بيشتغل مع or بدون database name)
    connection = await mysql.createConnection(mysqlUrl);
    
    console.log('✅ Connected to MySQL database');

    // استخراج اسم قاعدة البيانات من MYSQL_URL أو استخدام default
    let dbName = 'railway'; // default
    
    // محاولة استخراج اسم قاعدة البيانات من URL
    const match = mysqlUrl.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1]) {
      dbName = match[1];
    }

    // التأكد من استخدام قاعدة البيانات الصحيحة
    await connection.query(`USE ${dbName}`);

    // جدول المستخدمين
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_role (role)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('✅ Users table created/verified');

    // جدول الكتب
    await connection.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(255),
        file_name VARCHAR(255),
        category VARCHAR(100),
        published_year INT,
        pages INT,
        cover_url VARCHAR(255),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_title (title),
        INDEX idx_author (author),
        INDEX idx_category (category),
        FULLTEXT idx_search (title, author, description)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('✅ Books table created/verified');

    // جدول الأسئلة والإجابات (للـ AI)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS qa_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        book_id INT,
        question TEXT NOT NULL,
        answer TEXT,
        confidence DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_book_id (book_id),
        INDEX idx_created_at (created_at)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('✅ Q&A history table created/verified');

    // جدول المفضلة
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorite (user_id, book_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('✅ Favorites table created/verified');

    // جدول الكويزات
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        book_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_by INT NOT NULL,
        published TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_book_id (book_id),
        INDEX idx_created_by (created_by),
        INDEX idx_published (published)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('✅ Quizzes table created/verified');

    // جدول أسئلة الكويزات
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quiz_id INT NOT NULL,
        question TEXT NOT NULL,
        options_json VARCHAR(1024) NOT NULL,
        answer_index INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        INDEX idx_quiz_id (quiz_id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('✅ Quiz questions table created/verified');

    // جدول نتائج الكويزات
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quiz_id INT NOT NULL,
        user_id INT NOT NULL,
        score INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_quiz_id (quiz_id),
        INDEX idx_user_id (user_id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('✅ Quiz results table created/verified');

    console.log('✅ All database tables initialized successfully');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

module.exports = initializeDatabase;