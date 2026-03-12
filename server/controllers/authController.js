const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // التحقق من صحة البيانات
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const connection = await pool.getConnection();

    // التحقق من وجود المستخدم
    const [existingUser] = await connection.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إدراج المستخدم الجديد
    const [result] = await connection.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.insertId, email, username, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// تسجيل الدخول
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    connection.release();

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
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// الحصول على بيانات المستخدم
exports.getProfile = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // حساب إجمالي النقاط للمستخدم من جميع الكويزات
    const [totals] = await connection.query(
      'SELECT SUM(score) AS totalPoints FROM quiz_results WHERE user_id = ?',
      [req.user.id]
    );
    const totalPoints = totals[0].totalPoints || 0;

    // حساب الترتيب العالمي بناءً على مجموع النقاط
    const [higher] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM (
         SELECT user_id, SUM(score) AS total
         FROM quiz_results
         GROUP BY user_id
         HAVING total > ?
       ) AS t`,
      [totalPoints]
    );
    const globalRank = higher[0].cnt + 1;

    connection.release();

    return res.status(200).json({
      success: true,
      user: { ...user, totalPoints, globalRank }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// تحديث الملف الشخصي
exports.updateProfile = async (req, res) => {
  try {
    const { username, avatar_url } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE users SET username = ?, avatar_url = ? WHERE id = ?',
      [username || req.user.username, avatar_url, req.user.id]
    );

    const [updatedUser] = await connection.query(
      'SELECT id, username, email, role, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    connection.release();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
