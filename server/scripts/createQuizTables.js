// Script to create quizzes-related tables if they do not exist
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
    await connection.query(`USE ${process.env.DB_NAME}`);

    const quizSql = `
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        book_id INT,
        title VARCHAR(255),
        created_by INT,
        published TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const questionsSql = `
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT,
        question TEXT,
        options_json TEXT,
        answer_index INT,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      );
    `;
    const resultsSql = `
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT,
        user_id INT,
        score INT,
        total_questions INT DEFAULT 0,
        bonus_points INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await connection.query(quizSql);
    await connection.query(questionsSql);
    await connection.query(resultsSql);

    // ensure columns exist for backwards compatibility (total_questions and bonus_points)
    try {
      await connection.query("ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS total_questions INT DEFAULT 0");
      await connection.query("ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS bonus_points INT DEFAULT 0");
    } catch (alterErr) {
      console.warn('[DB] alter quiz_results columns error:', alterErr.message);
    }

    console.log('✅ Quiz tables created or already exist.');
    await connection.end();
  } catch (err) {
    console.error('Error creating quiz tables:', err.message);
  }
}

createTables();
