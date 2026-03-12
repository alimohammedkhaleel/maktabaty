import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './library-presentation.css';

const LibraryPresentation = ({ onComplete }) => {
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Refs للعناصر
  const containerRef = useRef(null);
  const leftBookRef = useRef(null);
  const rightBookRef = useRef(null);
  const cornerItemsRef = useRef([]);
  const titleRef = useRef(null);
  const lineRef = useRef(null);
  const floatItemsRef = useRef([]);
  const patternRefs = useRef([]);

  // ألوان مريحة للعين وتليق بالمكتبة
  const libraryColors = [
    '#8B7355', // بني دافئ
    '#9E7B56', // بني فاتح
    '#C19A6B', // بيج
    '#D2B48C', // تان فاتح
    '#DEB887', // خشب
    '#F4E6D4', // بيج فاتح جداً
    '#E6D5B8', // كريمي
    '#A89C94', // رملي
    '#7F6E5B', // بني غامق
  ];

  useEffect(() => {
    // تأخير بسيط لضمان تحميل كل العناصر
    const startTimer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!animationStarted) return;

    // تحسين الأداء: استخدام will-change
    gsap.set([leftBookRef.current, rightBookRef.current, titleRef.current, lineRef.current, ...cornerItemsRef.current], {
      willChange: 'transform, opacity'
    });

    // إخفاء الكتب الرئيسية في البداية
    gsap.set([leftBookRef.current, rightBookRef.current], {
      opacity: 0,
      scale: 0.8,
      x: leftBookRef.current === leftBookRef.current ? -50 : 50
    });

    // إخفاء عناصر الزوايا في البداية
    gsap.set(cornerItemsRef.current, {
      opacity: 0,
      scale: 0.5
    });

    gsap.set(titleRef.current, {
      scale: 0,
      opacity: 0
    });

    gsap.set(lineRef.current, {
      x: '-200%',
      y: 0,
      opacity: 0
    });

    // إنشاء Timeline رئيسي
    const tl = gsap.timeline();

    // 1. ظهور عناصر الزوايا الأربعة
    tl.to(cornerItemsRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.2)'
    })

    // 2. ظهور الكتب الرئيسية من الجانبين
    .to([leftBookRef.current, rightBookRef.current], {
      opacity: 1,
      scale: 1,
      x: 0,
      duration: 1,
      stagger: 0.3,
      ease: 'power3.out',
      onStart: () => {
        gsap.to(floatItemsRef.current, {
          y: '+=8',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }, '-=0.3')

    // 3. ظهور عنوان "مكتبة الاخلاق" مع تأثير
    .to(titleRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.4)',
      onComplete: () => {
        gsap.to(titleRef.current, {
          scale: 1.03,
          duration: 0.4,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }, '-=0.3')

    // 4. ظهور الخط من اليسار
    .to(lineRef.current, {
      x: '0%',
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2')

    // 5. الخط يتحرك للأعلى
    .to(lineRef.current, {
      y: -200,
      duration: 0.5,
      ease: 'power2.out'
    })

    // 6. الخط يتحرك للأسفل
    .to(lineRef.current, {
      y: 200,
      duration: 0.9,
      ease: 'power2.in',
      opacity: 0
    })

    // 7. إخفاء عنوان "مكتبة الاخلاق" بعد اختفاء الخط
    .to(titleRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'back.in(1.5)',
      onComplete: () => {
        // بدء حركة إخفاء الخلفية فور اختفاء العنوان
        gsap.to(containerRef.current, {
          y: '100%',
          duration: 1.2,
          ease: 'power4.inOut',
          onComplete: onComplete
        });
      }
    }, '-=0.3')

    // 8. تأثيرات بسيطة للأنماط الخلفية
    .to(patternRefs.current, {
      scale: 1,
      opacity: 0.15,
      duration: 1.2,
      stagger: 0.15,
      ease: 'sine.out'
    }, '-=0.3');

    return () => {
      tl.kill();
    };
  }, [animationStarted, onComplete]);

  return (
    <div className="presentation-wrapper" ref={containerRef}>
      {/* خلفية متدرجة بألوان مريحة */}
      <div className="bg-gradient"></div>
      
      {/* عناصر الزوايا الأربعة */}
      <div className="corner-item top-left-item" 
           ref={el => cornerItemsRef.current[0] = el}>
        <div className="corner-icon">📚</div>
      </div>
      
      <div className="corner-item top-right-item" 
           ref={el => cornerItemsRef.current[1] = el}>
        <div className="corner-icon">📚</div>
      </div>
      
      <div className="corner-item bottom-left-item" 
           ref={el => cornerItemsRef.current[2] = el}>
        <div className="corner-icon">📚</div>
      </div>
      
      <div className="corner-item bottom-right-item" 
           ref={el => cornerItemsRef.current[3] = el}>
        <div className="corner-icon">📚</div>
      </div>

      {/* أنماط خلفية بسيطة */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`pattern-${i}`}
          className="bg-pattern"
          ref={el => patternRefs.current[i] = el}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            width: `${Math.random() * 150 + 80}px`,
            height: `${Math.random() * 150 + 80}px`,
            background: `radial-gradient(circle, ${libraryColors[i % libraryColors.length]}20 0%, transparent 70%)`,
            opacity: 0,
            transform: 'scale(0)'
          }}
        />
      ))}

      {/* عناصر عائمة بسيطة */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`float-item-${i}`}
          className="float-element"
          ref={el => floatItemsRef.current[i] = el}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animationDelay: `${i * 0.5}s`
          }}
        >
          📖
        </div>
      ))}

      {/* المحتوى الرئيسي في المنتصف */}
      <div className="main-content">
        {/* الكتاب الأيسر */}
        <div className="side-book left-book" ref={leftBookRef}>
          <div className="book-emoji">📖</div>
        </div>

        {/* العنوان في المنتصف */}
        <div className="title-section">
          <h1 className="main-title" ref={titleRef}>
            مكتبة الاخلاق
          </h1>
          <div className="line-container">
            <div className="decorative-line" ref={lineRef}></div>
          </div>
        </div>

        {/* الكتاب الأيمن */}
        <div className="side-book right-book" ref={rightBookRef}>
          <div className="book-emoji">📕</div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPresentation;