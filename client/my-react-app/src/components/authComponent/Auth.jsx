import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/apppi'; // ✅ استيراد api الجديد
import useAuthStore from '../../store/authStore';
import './Auth.css';

const Auth = ({ onSuccess }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  // بيانات النموذج
  const [formData, setFormData] = useState({
    signIn: { email: '', password: '' },
    signUp: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const key = isSignIn ? 'signIn' : 'signUp';
    setFormData({
      ...formData,
      [key]: { ...formData[key], [name]: value },
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login(
        formData.signIn.email,
        formData.signIn.password
      );

      if (response.success) {
        setAuth(response.user, response.token);
        onSuccess?.();
      } else {
        setError(response.message || 'خطأ في تسجيل الدخول');
      }
    } catch (err) {
      setError(err.message || 'خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { username, email, password, confirmPassword } = formData.signUp;
      const response = await api.register(username, email, password, confirmPassword);

      if (response.success) {
        setAuth(response.user, response.token);
        onSuccess?.();
      } else {
        setError(response.message || 'خطأ في التسجيل');
      }
    } catch (err) {
      setError(err.message || 'خطأ في التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="auth-container">
      {/* الخلفية المتحركة */}
      <div className="auth-background">
        <motion.div
          className="gradient-orb orb-1"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="gradient-orb orb-2"
          animate={{ scale: [1.2, 1, 1.2], rotate: [180, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* مربع المصادقة الرئيسي */}
      <motion.div
        className="auth-box"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* لوحة التبديل */}
        <div className="auth-toggle">
          <motion.button
            className={`toggle-btn ${isSignIn ? 'active' : ''}`}
            onClick={() => {
              setIsSignIn(true);
              setError('');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            تسجيل الدخول
          </motion.button>
          <motion.button
            className={`toggle-btn ${!isSignIn ? 'active' : ''}`}
            onClick={() => {
              setIsSignIn(false);
              setError('');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            إنشاء حساب
          </motion.button>
        </div>

        {/* محتوى النموذج */}
        <motion.div
          className="auth-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          key={isSignIn ? 'signin' : 'signup'}
        >
          <motion.h2 variants={itemVariants} className="auth-title">
            {isSignIn ? 'أهلاً بعودتك! 👋' : 'اهلا بك معنا! 🎉'}
          </motion.h2>

          {/* رسالة الخطأ */}
          {error && (
            <motion.div
              className="error-message"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <form
            onSubmit={isSignIn ? handleSignIn : handleSignUp}
            className="auth-form"
          >
            {/* حقول التسجيل */}
            {!isSignIn && (
              <motion.div
                className="input-group"
                variants={itemVariants}
              >
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="اسم المستخدم"
                  value={formData.signUp.username}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            )}

            {/* البريد الإلكتروني */}
            <motion.div
              className="input-group"
              variants={itemVariants}
            >
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="البريد الإلكتروني"
                value={isSignIn ? formData.signIn.email : formData.signUp.email}
                onChange={handleChange}
                required
              />
            </motion.div>

            {/* كلمة المرور */}
            <motion.div
              className="input-group"
              variants={itemVariants}
            >
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="كلمة المرور"
                value={isSignIn ? formData.signIn.password : formData.signUp.password}
                onChange={handleChange}
                required
              />
            </motion.div>

            {/* تأكيد كلمة المرور */}
            {!isSignIn && (
              <motion.div
                className="input-group"
                variants={itemVariants}
              >
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="تأكيد كلمة المرور"
                  value={formData.signUp.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            )}

            {/* زر الإرسال */}
            <motion.button
              className="submit-btn"
              type="submit"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⏳
                </motion.span>
              ) : (
                isSignIn ? 'دخول' : 'إنشاء حساب'
              )}
            </motion.button>
          </form>

          {/* خيارات الدخول الاجتماعي */}
          <motion.div
            className="social-login"
            variants={itemVariants}
          >
            <motion.button
              className="social-btn"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              f
            </motion.button>
            <motion.button
              className="social-btn"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              G
            </motion.button>
            <motion.button
              className="social-btn"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              in
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;