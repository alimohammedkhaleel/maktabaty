const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  const client = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const conn = await client.connect();

    // Auto-update trigger function
    await conn.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        username    VARCHAR(100) UNIQUE NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        avatar_url  VARCHAR(255),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role)`);
    await conn.query(`
      DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
    `);
    await conn.query(`
      CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // books table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS books (
        id              SERIAL PRIMARY KEY,
        title           VARCHAR(255) NOT NULL,
        author          VARCHAR(255) NOT NULL,
        description     TEXT,
        file_url        VARCHAR(255),
        file_name       VARCHAR(255),
        category        VARCHAR(100),
        published_year  INT,
        pages           INT,
        cover_url       VARCHAR(255),
        created_by      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_books_title      ON books(title)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_books_author     ON books(author)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_books_category   ON books(category)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by)`);
    await conn.query(`DROP TRIGGER IF EXISTS trg_books_updated_at ON books`);
    await conn.query(`
      CREATE TRIGGER trg_books_updated_at
        BEFORE UPDATE ON books
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // qa_history table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS qa_history (
        id          SERIAL PRIMARY KEY,
        user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id     INT REFERENCES books(id) ON DELETE SET NULL,
        question    TEXT NOT NULL,
        answer      TEXT,
        confidence  DECIMAL(3,2),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_qa_user_id ON qa_history(user_id)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_qa_book_id ON qa_history(book_id)`);

    // favorites table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id          SERIAL PRIMARY KEY,
        user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id     INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, book_id)
      )
    `);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_favorites_book_id ON favorites(book_id)`);

    // quizzes table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id          SERIAL PRIMARY KEY,
        book_id     INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        title       VARCHAR(255) NOT NULL DEFAULT '',
        created_by  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        published   SMALLINT DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_quizzes_book_id    ON quizzes(book_id)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_quizzes_published  ON quizzes(published)`);
    await conn.query(`DROP TRIGGER IF EXISTS trg_quizzes_updated_at ON quizzes`);
    await conn.query(`
      CREATE TRIGGER trg_quizzes_updated_at
        BEFORE UPDATE ON quizzes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    // quiz_questions table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id              SERIAL PRIMARY KEY,
        quiz_id         INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question        TEXT NOT NULL,
        options_json    VARCHAR(1024) NOT NULL,
        answer_index    INT NOT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id)`);

    // quiz_results table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id          SERIAL PRIMARY KEY,
        quiz_id     INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score       INT NOT NULL DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id)`);
    await conn.query(`CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id)`);

    console.log('✅ PostgreSQL Database initialized successfully (7 tables ready)');
    conn.release();
    await client.end();
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    await client.end();
    throw error;
  }
}

module.exports = initializeDatabase;
