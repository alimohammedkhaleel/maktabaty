import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [showDescent, setShowDescent] = useState(true);
  const [showDisappear, setShowDisappear] = useState(false);
  const [showArcAnimation, setShowArcAnimation] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 5 كتب مع ألوان متناسقة
  const books = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 0.6,
    emoji: ['📚', '📖', '📘', '📗', '📕'][i % 5],
    title: ['مغامرات', 'علوم', 'تاريخ', 'فنون', 'قصص'][i % 5],
    bgColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 5],
    textColor: '#2c3e50',
  }));

  // نقطة البداية: في منتصف الصفحة
  const startX = windowWidth / 2 - 60;
  const startY = -200;

  // حساب وقت نزول آخر كتاب
  const lastBookDelay = 4 * 0.6;
  const descentDuration = 0.4;

  useEffect(() => {
    const disappearTimer = setTimeout(() => {
      setShowDescent(false);
      setShowDisappear(true);

      const arcTimer = setTimeout(() => {
        setShowDisappear(false);
        setShowArcAnimation(true);
      }, (books.length * 0.3 + 1.5) * 1000);

      return () => clearTimeout(arcTimer);
    }, (lastBookDelay + descentDuration + 0.5) * 1000);

    return () => clearTimeout(disappearTimer);
  }, []);

  // نقاط القوس
  const getArcPoints = () => {
    const points = [];
    const arcStartX = 20;
    const arcEndX = windowWidth - 20;
    const arcWidth = arcEndX - arcStartX;
    const arcHeight = 450;

    for (let x = arcStartX; x <= arcEndX; x += 35) {
      const t = (x - arcStartX) / arcWidth;
      const y = 300 - arcHeight * Math.sin(t * Math.PI);
      points.push({ x, y });
    }
    return points;
  };

  const arcPoints = getArcPoints();

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

      {/* قسم القوس */}
      <section className="arc-section">
        <div className="arc-container">
          {/* المرحلة 1: النزول من فوق لتحت */}
          {showDescent && books.map((book) => (
            <motion.div
              key={`descent-${book.id}`}
              className="arc-book"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <motion.div
                className="book-card"
                style={{
                  backgroundColor: book.bgColor,
                  color: book.textColor,
                }}
                initial={{
                  x: startX,
                  y: startY,
                  opacity: 0,
                  scale: 0.3,
                }}
                animate={{
                  x: startX,
                  y: 300,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: descentDuration,
                  delay: book.delay,
                  ease: "easeOut",
                }}
              >
                <span className="card-emoji">{book.emoji}</span>
                <span className="card-title">{book.title}</span>
              </motion.div>
            </motion.div>
          ))}

          {/* المرحلة 2: اختفاء الكتب */}
          {showDisappear && books.map((book, index) => (
            <motion.div
              key={`disappear-${book.id}`}
              className="arc-book"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <motion.div
                className="book-card"
                style={{
                  backgroundColor: book.bgColor,
                  color: book.textColor,
                }}
                initial={{
                  x: startX,
                  y: 300,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: startX,
                  y: 300,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.3,
                  ease: "easeOut",
                }}
              >
                <span className="card-emoji">{book.emoji}</span>
                <span className="card-title">{book.title}</span>
              </motion.div>
            </motion.div>
          ))}

          {/* المرحلة 3: الحركة النصف دائرية */}
          {showArcAnimation && (
            <>
              {books.map((book, index) => (
                <motion.div
                  key={`arc-${book.id}`}
                  className="arc-book arc-animation"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                >
                  <motion.div
                    className="book-card"
                    style={{
                      backgroundColor: book.bgColor,
                      color: book.textColor,
                    }}
                    initial={{
                      x: startX,
                      y: 300,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      x: arcPoints.map(p => p.x),
                      y: arcPoints.map(p => p.y),
                      opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9],
                      scale: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9],
                    }}
                    transition={{
                      duration: 7,
                      delay: index * 1.43,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
                    }}
                  >
                    <span className="card-emoji">{book.emoji}</span>
                    <span className="card-title">{book.title}</span>
                  </motion.div>
                </motion.div>
              ))}
            </>
          )}
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