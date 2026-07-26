-- ============================================================
-- Migration 001: Initialize Maktabaty Database (PostgreSQL)
-- Target: Neon PostgreSQL
-- ============================================================

-- Trigger function for auto-updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(100) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url  VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: books
-- ============================================================
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
);

CREATE INDEX IF NOT EXISTS idx_books_title    ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author   ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by);

DROP TRIGGER IF EXISTS trg_books_updated_at ON books;
CREATE TRIGGER trg_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: qa_history  (AI Q&A)
-- ============================================================
CREATE TABLE IF NOT EXISTS qa_history (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id     INT REFERENCES books(id) ON DELETE SET NULL,
    question    TEXT NOT NULL,
    answer      TEXT,
    confidence  DECIMAL(3,2),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_qa_user_id ON qa_history(user_id);
CREATE INDEX IF NOT EXISTS idx_qa_book_id ON qa_history(book_id);

-- ============================================================
-- TABLE: favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id     INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_book_id ON favorites(book_id);

-- ============================================================
-- TABLE: quizzes
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id          SERIAL PRIMARY KEY,
    book_id     INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL DEFAULT '',
    created_by  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published   SMALLINT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quizzes_book_id    ON quizzes(book_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_published  ON quizzes(published);

DROP TRIGGER IF EXISTS trg_quizzes_updated_at ON quizzes;
CREATE TRIGGER trg_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: quiz_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id              SERIAL PRIMARY KEY,
    quiz_id         INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question        TEXT NOT NULL,
    options_json    VARCHAR(1024) NOT NULL,
    answer_index    INT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- ============================================================
-- TABLE: quiz_results
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_results (
    id          SERIAL PRIMARY KEY,
    quiz_id     INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score       INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);

-- ============================================================
-- Done!
-- ============================================================
