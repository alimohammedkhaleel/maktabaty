import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faTimesCircle,
  faBookOpen,
  faUser,
  faCalendar,
  faLayerGroup,
  faFilePdf,
  faRobot,
  faPenFancy,
  faRotate,
  faTrashCan,
  faQuestionCircle,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { booksService, quizService } from '../../services/authService';
import useBooksStore from '../../store/booksStore';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { books, setBooks, isLoading, setLoading, error, setError } = useBooksStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    published_year: new Date().getFullYear(),
    pages: '',
    cover_url: '',
    pdfFile: null,
  });
  const [quizModal, setQuizModal] = useState({ open: false, quizId: null, questions: [] });
  const [bookQuizzes, setBookQuizzes] = useState({});

  useEffect(() => {
    fetchBooks();
    fetchQuizzesForBooks();
  }, []);

  const fetchQuizzesForBooks = async () => {
    try {
      const res = await quizService.listAllQuizzes();
      if (res.data.success) {
        const quizzesMap = {};
        res.data.quizzes.forEach(quiz => {
          quizzesMap[quiz.book_id] = quiz;
        });
        setBookQuizzes(quizzesMap);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      console.log('[ADMIN] Search query:', value);
    }, 300);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksService.getAllBooks();
      if (response.data.success) {
        setBooks(response.data.books);
      }
    } catch (err) {
      setError('خطأ في تحميل الكتب');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (book) => {
    if (!book.file_url) {
      setError('❌ لا يوجد ملف PDF للكتاب. يرجى رفع ملف PDF أولاً.');
      return;
    }
    try {
      setIsGeneratingQuiz(true);
      setError('');
      const res = await quizService.generateQuiz(book.id);
      if (res.data.success) {
        setQuizModal({ open: true, quizId: res.data.quizId, questions: res.data.autoQuestions || [] });
        setBookQuizzes(prev => ({
          ...prev,
          [book.id]: { id: res.data.quizId, book_id: book.id, title: res.data.quizTitle || '', published: 0 }
        }));
        setError('');
      } else {
        setError('❌ ' + (res.data.message || 'فشل في توليد الأسئلة'));
      }
    } catch (err) {
      console.error('Generate quiz error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'خطأ في توليد الكويز';
      setError('❌ ' + errorMsg);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleCreateQuiz = async (book) => {
    if (bookQuizzes[book.id]) {
      setError('يوجد بالفعل اختبار مرتبط بهذا الكتاب، يمكنك إعادة توليد أو حذفه.');
      return;
    }

    try {
      setIsGeneratingQuiz(true);
      setError('');
      const res = await quizService.createQuiz(book.id);
      if (res.data.success) {
        const newQuizId = res.data.quizId;
        setQuizModal({ open: true, quizId: newQuizId, questions: [] });
        setBookQuizzes(prev => ({
          ...prev,
          [book.id]: { id: newQuizId, book_id: book.id, title: '', published: 0 }
        }));
      } else {
        setError('❌ ' + (res.data.message || 'فشل في إنشاء الكويز'));
      }
    } catch (err) {
      console.error('Create quiz error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'خطأ في إنشاء الكويز';
      setError('❌ ' + errorMsg);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // دالة جديدة لإنشاء أسئلة يدوية للمسؤول
  const handleCreateManualQuestions = async (book) => {
    try {
      // التحقق من وجود كويز للكتاب
      let quizId = bookQuizzes[book.id]?.id;
      
      // إذا لم يكن هناك كويز، قم بإنشاء واحد أولاً
      if (!quizId) {
        setIsGeneratingQuiz(true);
        const res = await quizService.createQuiz(book.id);
        if (res.data.success) {
          quizId = res.data.quizId;
          setBookQuizzes(prev => ({
            ...prev,
            [book.id]: { id: quizId, book_id: book.id, title: '', published: 0 }
          }));
        } else {
          setError('❌ فشل في إنشاء الكويز');
          return;
        }
        setIsGeneratingQuiz(false);
      }

      // فتح نافذة إضافة الأسئلة
      setQuizModal({ open: true, quizId, questions: [] });
      
    } catch (err) {
      console.error('Error creating manual questions:', err);
      setError('❌ خطأ في إنشاء الأسئلة');
      setIsGeneratingQuiz(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (!quizModal.quizId) {
      setError('معرف الكويز غير صحيح');
      return;
    }
    try {
      setLoading(true);
      const response = await quizService.publishQuiz(quizModal.quizId);
      if (response.data.success) {
        alert('تم نشر الكويز بنجاح! يمكنك معاينته الآن.');
        setQuizModal({ open: false, quizId: null, questions: [] });
      } else {
        setError(response.data.message || 'فشل نشر الكويز');
      }
    } catch (err) {
      console.error('Publish quiz error:', err);
      setError(err.response?.data?.message || 'خطأ في نشر الكويز');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQ = [...quizModal.questions];
    if (field === 'answerIndex') {
      newQ[index].answerIndex = parseInt(value);
    } else if (field.startsWith('option')) {
      const optIdx = parseInt(field.replace('option', ''), 10);
      newQ[index].options[optIdx] = value;
    } else {
      newQ[index][field] = value;
    }
    setQuizModal({ ...quizModal, questions: newQ });
  };

  const handleSaveQuestion = async (q, index) => {
    try {
      await quizService.updateQuestion(q.id, {
        question: q.question,
        options: q.options,
        answerIndex: q.answerIndex
      });
      alert('تم حفظ السؤال');
    } catch (err) {
      console.error('Save question error:', err);
      alert('فشل حفظ السؤال');
    }
  };

  const handleDeleteQuestion = async (qid, index) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    try {
      await quizService.deleteQuestion(qid);
      const newQ = [...quizModal.questions];
      newQ.splice(index, 1);
      setQuizModal({ ...quizModal, questions: newQ });
    } catch (err) {
      console.error('Delete question error:', err);
      alert('فشل حذف السؤال');
    }
  };

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    answerIndex: 0
  });
  
  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await quizService.addQuestion(quizModal.quizId, newQuestion);
      if (res.data.success) {
        setQuizModal({
          ...quizModal,
          questions: [...quizModal.questions, { id: res.data.questionId, ...newQuestion }]
        });
        setNewQuestion({ question: '', options: ['', '', '', ''], answerIndex: 0 });
      }
    } catch (err) {
      console.error('Add question error:', err);
      alert('فشل إضافة السؤال');
    }
  };

  const handleRegenerateQuestions = async () => {
    if (!quizModal.quizId) return;
    await handleRegenerateForId(quizModal.quizId);
  };

  const handleRegenerateForId = async (quizId) => {
    if (!quizId) return;
    if (!window.confirm('سيتم إنشاء أسئلة جديدة وحذف القديمة، هل تريد المتابعة؟')) return;
    try {
      setIsGeneratingQuiz(true);
      const res = await quizService.regenerateQuiz(quizId);
      if (res.data.success) {
        if (quizModal.quizId === quizId) {
          setQuizModal({ ...quizModal, questions: res.data.questions });
        }
      }
    } catch (err) {
      console.error('Regenerate error:', err);
      alert('فشل توليد أسئلة جديدة');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response;
      if (formData.pdfFile) {
        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('author', formData.author);
        fd.append('description', formData.description || '');
        fd.append('category', formData.category || '');
        fd.append('published_year', formData.published_year || '');
        fd.append('pages', formData.pages || '');
        fd.append('cover_url', formData.cover_url || '');
        fd.append('pdf', formData.pdfFile);
        response = await booksService.addBook(fd);
      } else {
        response = await booksService.addBook(formData);
      }
      if (response.data.success) {
        setBooks([response.data.book, ...books]);
        setFormData({
          title: '',
          author: '',
          description: '',
          category: '',
          published_year: new Date().getFullYear(),
          pages: '',
          cover_url: '',
          pdfFile: null,
        });
        setShowForm(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إضافة الكتاب');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await booksService.updateBook(editingId, formData);
      if (response.data.success) {
        const updatedBooks = books.map((book) =>
          book.id === editingId ? { ...book, ...formData } : book
        );
        setBooks(updatedBooks);
        setFormData({
          title: '',
          author: '',
          description: '',
          category: '',
          published_year: new Date().getFullYear(),
          pages: '',
          cover_url: '',
        });
        setEditingId(null);
        setShowForm(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تحديث الكتاب');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
      return;
    }

    try {
      setLoading(true);
      const response = await booksService.deleteBook(id);
      if (response.data.success) {
        setBooks(books.filter((book) => book.id !== id));
        const newBookQuizzes = { ...bookQuizzes };
        delete newBookQuizzes[id];
        setBookQuizzes(newBookQuizzes);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في حذف الكتاب');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      published_year: book.published_year,
      pages: book.pages,
      cover_url: book.cover_url,
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleDeleteQuizById = async (bookId, quizId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
    try {
      await quizService.deleteQuiz(quizId);
      const newBookQuizzes = { ...bookQuizzes };
      delete newBookQuizzes[bookId];
      setBookQuizzes(newBookQuizzes);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert('فشل حذف الكويز');
    }
  };

  const filteredBooks = React.useMemo(() => books.filter(
    (book) =>
      book.title.includes(searchQuery) ||
      book.author.includes(searchQuery) ||
      book.category.includes(searchQuery)
  ), [books, searchQuery]);

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
    <div className="admin-dashboard">
      {/* الهيدر */}
      <motion.div
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <h1>📚 لوحة التحكم - إدارة الكتب</h1>
          <p>إضافة وتعديل وحذف الكتب من المكتبة</p>
        </div>
        <motion.button
          className="admin-btn-add-book"
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: '',
              author: '',
              description: '',
              category: '',
              published_year: new Date().getFullYear(),
              pages: '',
              cover_url: '',
            });
            setShowForm(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faPlus} /> إضافة كتاب جديد
        </motion.button>
      </motion.div>

      {/* شريط البحث */}
      <motion.div
        className="admin-search-bar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="ابحث عن كتاب باسم المؤلف أو التصنيف..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </motion.div>

      {/* رسالة الخطأ */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="admin-error-banner"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            ⚠️ {error}
            <button onClick={() => setError('')}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نموذج الإضافة/التحديث */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="admin-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="admin-close-btn"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>

              <h2>{editingId ? '✏️ تعديل الكتاب' : '📖 إضافة كتاب جديد'}</h2>

              <form
                onSubmit={editingId ? handleUpdateBook : handleAddBook}
                className="admin-book-form"
              >
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>عنوان الكتاب</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>المؤلف</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>الفئة</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>سنة النشر</label>
                    <input
                      type="number"
                      value={formData.published_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          published_year: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>عدد الصفحات</label>
                    <input
                      type="number"
                      value={formData.pages}
                      onChange={(e) =>
                        setFormData({ ...formData, pages: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>رابط الغلاف</label>
                    <input
                      type="url"
                      value={formData.cover_url}
                      onChange={(e) =>
                        setFormData({ ...formData, cover_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group admin-full-width">
                    <label>تحميل ملف PDF (اختياري)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setFormData({ ...formData, pdfFile: e.target.files[0] })}
                    />
                    {formData.pdfFile && (
                      <p className="admin-file-preview">ملف مختار: {formData.pdfFile.name}</p>
                    )}
                  </div>
                </div>

                <div className="admin-form-group admin-full-width">
                  <label>الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="4"
                    placeholder="أدخل وصف الكتاب..."
                  />
                </div>

                <div className="admin-form-actions">
                  <motion.button
                    type="submit"
                    className="admin-btn-submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? '⏳ جاري...' : editingId ? 'تحديث' : 'إضافة'}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="admin-btn-cancel"
                    onClick={() => setShowForm(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    إلغاء
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* قائمة الكتب */}
      <motion.div
        className="admin-books-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading && (
          <motion.div className="admin-loading-spinner">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⏳
            </motion.div>
            <p>جاري التحميل...</p>
          </motion.div>
        )}

        {!isLoading && filteredBooks.length === 0 ? (
          <motion.div
            className="admin-empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="admin-empty-icon">📚</div>
            <p>لا توجد كتب حالياً</p>
          </motion.div>
        ) : (
          filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              className="admin-book-card"
              variants={itemVariants}
              whileHover={{ y: -5 }}
              layoutId={`admin-book-${book.id}`}
            >
              {/* أيقونة الكتاب بدلاً من الصورة */}
              <div className="admin-book-cover">
                <div className="admin-book-icon">
                  <FontAwesomeIcon icon={faBookOpen} />
                </div>
              </div>

              {/* معلومات الكتاب */}
              <div className="admin-book-info">
                <h3 title={book.title}>{book.title}</h3>
                
                <div className="admin-book-meta">
                  <div className="admin-meta-item">
                    <FontAwesomeIcon icon={faUser} className="admin-meta-icon" />
                    <span>{book.author}</span>
                  </div>
                  
                  {book.category && (
                    <div className="admin-meta-item">
                      <FontAwesomeIcon icon={faLayerGroup} className="admin-meta-icon" />
                      <span>{book.category}</span>
                    </div>
                  )}
                  
                  <div className="admin-meta-row">
                    {book.published_year && (
                      <div className="admin-meta-item">
                        <FontAwesomeIcon icon={faCalendar} className="admin-meta-icon" />
                        <span>{book.published_year}</span>
                      </div>
                    )}
                    
                    {book.pages && (
                      <div className="admin-meta-item">
                        <span>{book.pages} صفحة</span>
                      </div>
                    )}
                  </div>
                </div>

                {book.description && (
                  <p className="admin-description" title={book.description}>
                    {book.description}
                  </p>
                )}

                {book.file_url && (
                  <a 
                    href={`http://localhost:3001${book.file_url}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="admin-pdf-link"
                  >
                    <FontAwesomeIcon icon={faFilePdf} />
                    <span>عرض PDF</span>
                  </a>
                )}
              </div>

              {/* أزرار التحكم */}
              <div className="admin-book-actions">
                <div className="admin-actions-primary">
                  <motion.button
                    className="admin-btn-icon admin-btn-edit"
                    onClick={() => handleEdit(book)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="تعديل الكتاب"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </motion.button>
                  <motion.button
                    className="admin-btn-icon admin-btn-delete"
                    onClick={() => handleDeleteBook(book.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="حذف الكتاب"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </motion.button>
                </div>

                <div className="admin-actions-quiz">
                  {/* زر إنشاء أسئلة يدوي (للمسؤول) - موجود دائماً */}
                  <motion.button
                    className="admin-btn-quiz admin-btn-manual"
                    onClick={() => handleCreateManualQuestions(book)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="إنشاء أسئلة يدوية"
                  >
                    <FontAwesomeIcon icon={faPenFancy} />
                    <span>أسئلة يدوي</span>
                  </motion.button>

                  {!bookQuizzes[book.id] ? (
                    <>
                      <motion.button
                        className="admin-btn-quiz admin-btn-create"
                        onClick={() => handleCreateQuiz(book)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="إنشاء اختبار يدوي"
                      >
                        <FontAwesomeIcon icon={faList} />
                        <span>إنشاء اختبار</span>
                      </motion.button>
                      <motion.button
                        className="admin-btn-quiz admin-btn-generate"
                        onClick={() => handleGenerateQuiz(book)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!book.file_url}
                        title={!book.file_url ? "يجب رفع ملف PDF أولاً" : "توليد اختبار تلقائي"}
                      >
                        <FontAwesomeIcon icon={faRobot} />
                        <span>توليد تلقائي</span>
                      </motion.button>
                    </>
                  ) : (
                    <div className="admin-quiz-actions">
                      <span className="admin-quiz-badge">
                        يوجد اختبار
                      </span>
                      <motion.button
                        className="admin-btn-quiz admin-btn-regenerate"
                        onClick={() => {
                          const quiz = bookQuizzes[book.id];
                          setQuizModal({ open: true, quizId: quiz.id, questions: [] });
                          handleRegenerateForId(quiz.id);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="إعادة توليد الأسئلة"
                      >
                        <FontAwesomeIcon icon={faRotate} />
                      </motion.button>
                      <motion.button
                        className="admin-btn-quiz admin-btn-delete-quiz"
                        onClick={() => handleDeleteQuizById(book.id, bookQuizzes[book.id].id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="حذف الاختبار"
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Loading modal while generating quiz */}
      <AnimatePresence>
        {isGeneratingQuiz && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="admin-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ textAlign: 'center', minHeight: '250px' }}
            >
              <motion.div
                style={{ fontSize: '3rem', marginBottom: '20px' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                ✨
              </motion.div>
              <h2>جاري التحميل...</h2>
              <p style={{ marginTop: '15px', color: '#888' }}>
                يرجى الانتظار قليلاً
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz review modal for admin */}
      <AnimatePresence>
        {quizModal.open && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuizModal({ open: false, quizId: null, questions: [] })}
          >
            <motion.div
              className="admin-modal-content admin-quiz-review"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>✅ إدارة الأسئلة</h2>
              <div className="admin-questions-list">
                {quizModal.questions && quizModal.questions.length > 0 ? (
                  quizModal.questions.map((q, idx) => (
                    <div key={q.id || idx} className="admin-generated-question">
                      <label>السؤال {idx + 1}:</label>
                      <textarea
                        value={q.question}
                        onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                      />

                      <div className="admin-options-edit">
                        {(q.options || []).map((opt, i) => (
                          <div key={i} className="admin-option-row">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleQuestionChange(idx, `option${i}`, e.target.value)}
                            />
                            <label>
                              <input
                                type="radio"
                                name={`correct-${idx}`}
                                checked={q.answerIndex === i}
                                onChange={() => handleQuestionChange(idx, 'answerIndex', i)}
                              />
                              صحيح
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="admin-question-actions">
                        {q.id && (
                          <>
                            <motion.button
                              className="admin-btn-save"
                              onClick={() => handleSaveQuestion(q, idx)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >حفظ</motion.button>
                            <motion.button
                              className="admin-btn-delete"
                              onClick={() => handleDeleteQuestion(q.id, idx)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >حذف</motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="admin-no-questions">لا توجد أسئلة حالياً. يمكنك إضافة أسئلة جديدة من الأسفل.</p>
                )}
              </div>

              {/* form to add new question */}
              <div className="admin-add-question-section">
                <h3>➕ إضافة سؤال جديد</h3>
                <form onSubmit={handleAddQuestionSubmit} className="admin-new-question-form">
                  <textarea
                    placeholder="نص السؤال"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    required
                  />
                  <div className="admin-options-edit">
                    {newQuestion.options.map((opt, i) => (
                      <div key={i} className="admin-option-row">
                        <input
                          type="text"
                          placeholder={`الخيار ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const opts = [...newQuestion.options];
                            opts[i] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: opts });
                          }}
                          required
                        />
                        <label>
                          <input
                            type="radio"
                            name="new-correct"
                            checked={newQuestion.answerIndex === i}
                            onChange={() => setNewQuestion({ ...newQuestion, answerIndex: i })}
                            required
                          />
                          صحيح
                        </label>
                      </div>
                    ))}
                  </div>
                  <motion.button
                    type="submit"
                    className="admin-btn-add-question"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >أضف السؤال</motion.button>
                </form>
              </div>

              <div className="admin-form-actions">
                <motion.button className="admin-btn-generate" onClick={handleRegenerateQuestions}>توليد أسئلة جديدة</motion.button>
                <motion.button className="admin-btn-submit" onClick={handlePublishQuiz}>نشر الكويز</motion.button>
                <motion.button className="admin-btn-cancel" onClick={() => setQuizModal({ open: false, quizId: null, questions: [] })}>إغلاق</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;