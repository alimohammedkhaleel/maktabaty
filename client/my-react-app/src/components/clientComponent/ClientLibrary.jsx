import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faBook } from '@fortawesome/free-solid-svg-icons';
import { booksService } from '../../services/authService';
import useBooksStore from '../../store/booksStore';
import BookCard from './BookCard';
import './ClientLibrary.css';

const ClientLibrary = () => {
  const {
    books,
    setBooks,
    favorites,
    addFavorite,
    removeFavorite,
    setLoading,
    isLoading,
  } = useBooksStore();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksService.getAllBooks();
      if (response.data.success) {
        setBooks(response.data.books);
      }
    } catch (error) {
      console.error('خطأ في تحميل الكتب');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (book) => {
    if (favorites.includes(book.id)) {
      removeFavorite(book.id);
      booksService.removeFromFavorites(book.id).catch(() => addFavorite(book.id));
    } else {
      addFavorite(book.id);
      booksService.addToFavorites(book.id).catch(() => removeFavorite(book.id));
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.includes(searchQuery) ||
      book.author.includes(searchQuery) ||
      book.category.includes(searchQuery)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="client-library">
      <motion.div
        className="library-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <h1>📚 مكتبتنا الرقمية تحت اشراف ا/رضا بكري</h1>
          <p>  استكشف مجموعة واسعة من الكتب تحت اشراف ا/رضا بكري</p>
        </div>
      </motion.div>

      <motion.div
        className="search-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="ابحث عن كتاب باسم أو المؤلف أو الفئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        className="books-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <motion.div className="loading-state">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <FontAwesomeIcon icon={faSpinner} />
            </motion.div>
            <p>جاري تحميل الكتب...</p>
          </motion.div>
        ) : filteredBooks.length === 0 ? (
          <motion.div className="empty-state">
            <FontAwesomeIcon icon={faBook} className="empty-icon" />
            <p>لا توجد كتب متطابقة</p>
          </motion.div>
        ) : (
          filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isFavorite={favorites.includes(book.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        )}
      </motion.div>
    </div>
  );
};

export default ClientLibrary;
