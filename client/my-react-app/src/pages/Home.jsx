import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="hero-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>مكتبة الاخلاق</h1>

          <motion.button
            className="cta-button"
            onClick={() => navigate('/books')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ابدأ القراءة الآن ←
          </motion.button>
        </motion.div>
      </motion.section>

      {/* قسم رحلة القارئ - Journey Section */}
      <section className="journey-section">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          رحلتك في عالم القراءة
        </motion.h2>

        <div className="journey-container">
          {[
            {
              step: '١',
              icon: '📖',
              title: 'اختر كتابك',
              description: 'استكشف مكتبة غنية بالكتب المتنوعة',
              color: '#FF6B6B',
              delay: 0.2
            },
            {
              step: '٢',
              icon: '📝',
              title: 'اقرأ وتعلم',
              description: 'استمتع بالقراءة مع ملخصات شاملة',
              color: '#4ECDC4',
              delay: 0.4
            },
            {
              step: '٣',
              icon: '🎯',
              title: 'اختبر نفسك',
              description: 'حل الاختبارات وقيّم فهمك',
              color: '#45B7D1',
              delay: 0.6
            },
            {
              step: '٤',
              icon: '🏆',
              title: 'احصل على النقاط',
              description: 'تنافس مع الآخرين وكن الأفضل',
              color: '#FFEAA7',
              delay: 0.8
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="journey-card"
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: item.delay }}
              whileHover={{ 
                scale: 1.05,
                rotate: index % 2 === 0 ? -2 : 2,
                transition: { duration: 0.3 }
              }}
            >
              <div className="step-number" style={{ background: item.color }}>
                {item.step}
              </div>
              <motion.div 
                className="journey-icon"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: item.delay
                }}
              >
                {item.icon}
              </motion.div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              
              {/* Animated connector line */}
              {index < 3 && (
                <motion.div 
                  className="connector-line"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: item.delay + 0.3 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Floating particles background */}
        <div className="journey-particles">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              {['📚', '✨', '💡', '🎓', '⭐'][i % 5]}
            </motion.div>
          ))}
        </div>
      </section>

      {/* مميزات المكتبة */}
      <motion.section
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2>مميزات المكتبة</h2>
        <div className="features-grid">
          {[
            { icon: '📚', title: 'مشروحات شاملة', description: 'اكتشف تفاصيل كل كتاب مع ملخصات وتحليلات' },
            { icon: '🎯', title: 'اختبارات ذكية', description: '30 سؤال متنوع لكل كتاب' },
            { icon: '🏆', title: 'نظام النقاط', description: 'اجمع النقاط وتتبع تقدمك' },
            { icon: '🌟', title: 'محتوى عربي', description: 'جميع المحتوى باللغة العربية' },
            { icon: '⚡', title: 'سرعة الإجابة', description: 'توليد فوري للأسئلة' },
            { icon: '📊', title: 'تحليلات متقدمة', description: 'إحصائيات دقيقة لتقدمك' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer مع اللينكات الصحيحة */}
      <motion.footer
        className="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p>© 2026 مكتبة الاخلاق - جميع الحقوق محفوظة</p>
        <div className="footer-links">
          {/* رابط واتساب صحيح - الصيغة الدولية بدون + */}
          <a 
            href="https://wa.me/201121360605" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon={faWhatsapp} /> واتساب
          </a>
          
          <span className="separator">|</span>
          
          {/* رابط Gmail صحيح - يفتح صفحة ارسال رسالة جديدة */}
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=alimohamedkhaleelabd@gmail.com&su=استفسار%20عن%20مكتبة%20الاخلاق&body=مرحبا%2C%0A%0Aأود%20الاستفسار%20عن%20المكتبة" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon={faEnvelope} /> Gmail
          </a>
          
          <span className="separator">|</span>
          
          {/* رابط انستغرام */}
          <a 
            href="https://www.instagram.com/ellol_pubg" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon={faInstagram} /> Instagram
          </a>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
