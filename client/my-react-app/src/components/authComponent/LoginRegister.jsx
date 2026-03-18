import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import api from '../../services/apppi'; // ✅ التعديل هنا
import useAuthStore from '../../store/authStore';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    signIn: { email: '', password: '' },
    signUp: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formType = isSignUp ? 'signUp' : 'signIn';
    setFormData({
      ...formData,
      [formType]: { ...formData[formType], [name]: value },
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login( // ✅ استخدم api.login
        formData.signIn.email,
        formData.signIn.password
      );

      if (response.success || response.token) { // ✅ تعديل هنا
        const userData = response.user || response;
        const token = response.token;
        setAuth(userData, token);
        
        setTimeout(() => {
          if (userData?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 300);
      }
    } catch (err) {
      setError(err.message || 'خطأ في تسجيل الدخول'); // ✅ تعديل هنا
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
      
      if (password !== confirmPassword) {
        setError('كلمات المرور غير متطابقة');
        setIsLoading(false);
        return;
      }

      const response = await api.register(username, email, password, confirmPassword); // ✅ استخدم api.register

      if (response.success || response.token) { // ✅ تعديل هنا
        const userData = response.user || response;
        const token = response.token;
        setAuth(userData, token);
        
        setTimeout(() => {
          if (userData?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 300);
      }
    } catch (err) {
      setError(err.message || 'خطأ في التسجيل'); // ✅ تعديل هنا
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className="auth-container">
      {/* Background Orbs */}
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className={`container ${isSignUp ? 'active' : ''}`}>
        {/* Login Form */}
        <div className="form-box login-box">
          <h2>تسجيل الدخول</h2>
          <form onSubmit={handleSignIn}>
            <div className="input-group">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="البريد الإلكتروني"
                value={formData.signIn.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="كلمة المرور"
                value={formData.signIn.password}
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn"
              disabled={isLoading}
            >
              {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
            </button>
          </form>
          <p>أو سجل عبر</p>
          <div className="social-login">
            <div className="icon">
              <FontAwesomeIcon icon={faFacebook} />
            </div>
            <div className="icon google-icon">G</div>
            <div className="icon">
              <FontAwesomeIcon icon={faLinkedin} />
            </div>
          </div>
        </div>
        
        {/* Register Form */}
        <div className="form-box register-box">
          <h2>إنشاء حساب</h2>
          <form onSubmit={handleSignUp}>
            <div className="input-group">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="اسم المستخدم"
                value={formData.signUp.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="البريد الإلكتروني"
                value={formData.signUp.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="كلمة المرور"
                value={formData.signUp.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="تأكيد كلمة المرور"
                value={formData.signUp.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn"
              disabled={isLoading}
            >
              {isLoading ? 'جاري التحميل...' : 'إنشاء حساب'}
            </button>
          </form>
          <p>أو سجل عبر</p>
          <div className="social-login">
            <div className="icon">
              <FontAwesomeIcon icon={faFacebook} />
            </div>
            <div className="icon google-icon">G</div>
            <div className="icon">
              <FontAwesomeIcon icon={faLinkedin} />
            </div>
          </div>
        </div>
        
        {/* Toggle panel for Desktop */}
        <div className="toggle-box toggle-login">
          <h2>مرحباً بعودتك!</h2>
          <p>لديك حساب بالفعل؟ اضغط أدناه لتسجيل الدخول</p>
          <button type="button" className="toggle-btn" onClick={() => setIsSignUp(false)}>تسجيل الدخول</button>
        </div>

        <div className="toggle-box toggle-register">
          <h2>مرحباً بك!</h2>
          <p>ليس لديك حساب بعد؟ ابدأ من هنا</p>
          <button type="button" className="toggle-btn" onClick={() => setIsSignUp(true)}>إنشاء حساب</button>
        </div>

        {/* Mobile Toggle Button */}
        <div className="mobile-toggle">
          <button 
            type="button" 
            className="mobile-toggle-btn"
            onClick={toggleMode}
          >
            {isSignUp ? '← لديك حساب؟ سجل دخولك' : '→ ليس لديك حساب؟ أنشئ حساباً'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginRegister;