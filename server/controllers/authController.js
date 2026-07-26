const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ─── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check duplicates
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows: [inserted] } = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: inserted.id, email, username, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: inserted.id, username, email, role: 'user' }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const { rows: users } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const { rows: users } = await pool.query(
      'SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Total points from all quizzes
    const { rows: totals } = await pool.query(
      'SELECT COALESCE(SUM(score), 0) AS "totalPoints" FROM quiz_results WHERE user_id = $1',
      [req.user.id]
    );
    const totalPoints = parseInt(totals[0].totalPoints) || 0;

    // Global rank (users with higher total score)
    const { rows: [higher] } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM (
         SELECT user_id, SUM(score) AS total
         FROM quiz_results
         GROUP BY user_id
         HAVING SUM(score) > $1
       ) AS t`,
      [totalPoints]
    );
    const globalRank = parseInt(higher.cnt) + 1;

    return res.status(200).json({
      success: true,
      user: { ...user, totalPoints, globalRank }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { username, avatar_url } = req.body;

    await pool.query(
      'UPDATE users SET username = $1, avatar_url = $2 WHERE id = $3',
      [username || req.user.username, avatar_url || null, req.user.id]
    );

    const { rows: [updatedUser] } = await pool.query(
      'SELECT id, username, email, role, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
