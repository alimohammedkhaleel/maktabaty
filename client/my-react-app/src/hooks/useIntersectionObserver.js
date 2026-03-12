import { useEffect, useRef } from 'react';

/**
 * Custom Hook لاستخدام IntersectionObserver
 * يساعد في تحسين الأداء بتحميل العناصر فقط عندما تودخل في viewport
 * 
 * @param {Function} onVisible - callback عند ظهور العنصر
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - نسبة ظهور العنصر (0-1)
 * @param {string} options.rootMargin - هامش بحث العنصر
 * @returns {React.RefObject} ref للعنصر المراقب
 */
export const useIntersectionObserver = (onVisible, options = {}) => {
  const ref = useRef(null);

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '200px',
    ...options
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onVisible();
        // استوب المراقبة بعد ظهور العنصر مرة واحدة
        observer.unobserve(entry.target);
      }
    }, defaultOptions);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onVisible]);

  return ref;
};

/**
 * Hook متقدم للتحكم في عرض العناصر بناءً على الرؤية
 */
export const useVisibility = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

export default useIntersectionObserver;
