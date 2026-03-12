import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './loading-screen.css';

const LoadingScreen = ({ onLoadingComplete }) => {
  const loaderRef = useRef(null);
  const textRef = useRef(null);
  const pagesRef = useRef([]);

  useEffect(() => {
    // تأكد من وجود المراجع
    if (!loaderRef.current || !pagesRef.current.length) return;

    // تسلسل حركات التحميل
    const tl = gsap.timeline({
      repeat: -1, // تكرار مستمر
      repeatDelay: 0.5,
      ease: 'power1.inOut'
    });

    // تحريك صفحات الكتاب
    tl.to(pagesRef.current, {
      rotateY: 180,
      y: -20,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.2)'
    })
    .to(pagesRef.current, {
      rotateY: 0,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.in(1.2)'
    });

    // تحريك النص
    gsap.to(textRef.current, {
      scale: 1.05,
      opacity: 0.8,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // محاكاة انتهاء التحميل بعد 2 ثانية
    const timer = setTimeout(() => {
      if (onLoadingComplete) {
        gsap.to(loaderRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: onLoadingComplete
        });
      }
    }, 2000);

    return () => {
      tl.kill();
      clearTimeout(timer);
    };
  }, [onLoadingComplete]);

  return (
    <div className="loading-screen" ref={loaderRef}>
      <div className="book-loader">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="loader-page"
            ref={el => pagesRef.current[index] = el}
            style={{
              background: `linear-gradient(135deg, ${index === 0 ? '#8B7355' : index === 1 ? '#9E7B56' : '#C19A6B'}, ${index === 0 ? '#9E7B56' : index === 1 ? '#C19A6B' : '#DEB887'})`
            }}
          />
        ))}
      </div>
      <p className="loading-text" ref={textRef}>جاري تحميل المكتبة...</p>
    </div>
  );
};

export default LoadingScreen;