import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faComments, 
  faStar,
  faFilePdf 
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // استيراد useNavigate
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const BookCard = ({ book, isFavorite, onToggleFavorite }) => {
  const [isInView, setIsInView] = useState(false);
  const navigate = useNavigate(); // استخدام useNavigate

  const ref = useIntersectionObserver(
    () => setIsInView(true),
    { threshold: 0.1, rootMargin: '200px' }
  );

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // دالة للذهاب إلى صفحة المحادثة
  const goToChatPage = (e) => {
    e.stopPropagation();
    // استخدم navigate مباشرة بدون onSelectBook
    navigate(`/chat/${book.id}`, { 
      state: { book } // نمرر بيانات الكتاب
    });
  };

  const handlePdfView = (e, pdfUrl) => {
    e.stopPropagation();
    if (pdfUrl) {
      window.open(`http://localhost:3001${pdfUrl}`, '_blank');
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (typeof onToggleFavorite === 'function') {
      onToggleFavorite(book);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="book-item"
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={isInView ? { scale: 1.02, y: -8 } : {}}
      layoutId={`client-book-${book.id}`}
    >
      {isInView && (
        <>
          <div className="book-cover">
            <div className="placeholder">
              <FontAwesomeIcon icon={faBook} />
            </div>

            <div className="overlay">
              <motion.button
                className="btn-read"
                onClick={goToChatPage} // استخدام الدالة الجديدة
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faComments} />
                اسأل الـ AI
              </motion.button>
              
              {book.file_url && (
                <motion.button
                  className="btn-pdf"
                  onClick={(e) => handlePdfView(e, book.file_url)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="عرض ملف PDF"
                >
                  <FontAwesomeIcon icon={faFilePdf} />
                  عرض PDF
                </motion.button>
              )}
            </div>
          </div>

          <div className="book-details">
            <h3>{book.title}</h3>
            <p className="author">🖊️ {book.author}</p>
            {book.category && <p className="category">📁 {book.category}</p>}
            {book.published_year && (
              <p className="year">📅 {book.published_year}</p>
            )}
            {book.pages && (
              <p className="pages">📄 {book.pages} صفحة</p>
            )}

            <motion.button
              className="btn-favorite"
              onClick={handleFavoriteClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon
                icon={faStar}
                className={isFavorite ? 'active' : ''}
              />
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default BookCard;