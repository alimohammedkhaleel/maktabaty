import React from 'react';
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
      <section className="hero-section">
        <div className="hero-content">
          <h1>مكتبة الاخلاق</h1>
          <p>اقرأ، تعلم، واختبر نفسك</p>
          <button className="cta-button" onClick={() => navigate('/books')}>
            ابدأ القراءة الآن ←
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <h3>50+</h3>
          <p>كتاب متنوع</p>
        </div>
        <div className="stat-card">
          <h3>1000+</h3>
          <p>سؤال اختبار</p>
        </div>
        <div className="stat-card">
          <h3>100%</h3>
          <p>محتوى عربي</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>لماذا مكتبة الاخلاق؟</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>مشروحات شاملة</h3>
            <p>اكتشف تفاصيل كل كتاب مع ملخصات وتحليلات</p>
          </div>
          <div className="feature-card">
            <h3>اختبارات ذكية</h3>
            <p>30 سؤال متنوع لكل كتاب</p>
          </div>
          <div className="feature-card">
            <h3>نظام النقاط</h3>
            <p>اجمع النقاط وتتبع تقدمك</p>
          </div>
          <div className="feature-card">
            <h3>محتوى عربي</h3>
            <p>جميع المحتوى باللغة العربية</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 مكتبة الاخلاق - جميع الحقوق محفوظة</p>
        <div className="footer-links">
          <a 
            href="https://wa.me/201121360605" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon={faWhatsapp} /> واتساب
          </a>
          
          <span className="separator">|</span>
          
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=alimohamedkhaleelabd@gmail.com&su=استفسار%20عن%20مكتبة%20الاخلاق&body=مرحبا%2C%0A%0Aأود%20الاستفسار%20عن%20المكتبة" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon={faEnvelope} /> Gmail
          </a>
          
          <span className="separator">|</span>
          
          <a 
            href="https://www.instagram.com/ellol_pubg" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon={faInstagram} /> Instagram
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
