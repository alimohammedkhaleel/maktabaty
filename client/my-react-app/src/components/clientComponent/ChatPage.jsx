import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faRobot, 
  faSpinner,
  faBookOpen,
  faUser,
  faCalendar,
  faLayerGroup,
  faFilePdf,
  faQuoteRight,
  faInfoCircle,
  faStar,
  faRedoAlt,
  faHashtag,
  faLanguage,
  faTag,
  faList
} from '@fortawesome/free-solid-svg-icons';
import { booksService, quizService } from '../../services/authService';
import './ChatPage.css';

const ChatPage = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Refs for animations
  const chatHeaderRef = useRef(null);
  const chatWelcomeRef = useRef(null);
  const chatQuestionsGridRef = useRef(null);
  const chatMessagesRef = useRef(null);
  
  // InView states
  const headerInView = useInView(chatHeaderRef, { once: true, amount: 0.3 });
  const welcomeInView = useInView(chatWelcomeRef, { once: true, amount: 0.3 });
  const questionsGridInView = useInView(chatQuestionsGridRef, { once: true, amount: 0.1 });
  const messagesInView = useInView(chatMessagesRef, { once: false, amount: 0.1 });
  
  const [book, setBook] = useState(location.state?.book || null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(!location.state?.book);
  const [chatError, setChatError] = useState(null);
  const [showQuestions, setShowQuestions] = useState(true);
  const [bookStats, setBookStats] = useState(null);
  const [bookQuiz, setBookQuiz] = useState(null);

  // Animation variants
  const chatContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const chatItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    }
  };

  const chatScaleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  const chatSlideVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction === 'left' ? -50 : 50,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  const chatMessageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 200
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  const chatStaggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  // جلب بيانات الكتاب والإحصائيات والكويز
  useEffect(() => {
    if (!book && bookId) {
      fetchBookDetails();
    } else if (book) {
      fetchBookStats();
      fetchBookQuiz();
      setIsFirstLoad(false);
    }
  }, [book, bookId]);

  // توليد الأسئلة الديناميكية بناءً على بيانات الكتاب
  const generateDynamicQuestions = () => {
    if (!book) return [];

    const questions = [
      {
        id: 1,
        text: '📖 عن ماذا يتحدث هذا الكتاب؟',
        icon: faInfoCircle,
        color: '#2c5c34',
        condition: true
      },
      {
        id: 2,
        text: '✍️ من هو المؤلف؟',
        icon: faUser,
        color: '#3d7d42',
        condition: true
      }
    ];

    if (book.published_year) {
      questions.push({
        id: 3,
        text: '📅 ما هي سنة النشر؟',
        icon: faCalendar,
        color: '#d4af37',
        condition: true
      });
    }

    if (book.pages) {
      questions.push({
        id: 4,
        text: '📄 كم عدد الصفحات؟',
        icon: faLayerGroup,
        color: '#8B4513',
        condition: true
      });
    }

    if (book.category) {
      questions.push({
        id: 7,
        text: '🏷️ ما هو تصنيف الكتاب؟',
        icon: faTag,
        color: '#9b59b6',
        condition: true
      });
    }

    if (book.language) {
      questions.push({
        id: 8,
        text: '🌐 ما هي لغة الكتاب؟',
        icon: faLanguage,
        color: '#e67e22',
        condition: true
      });
    }

    questions.push({
      id: 5,
      text: '💬 اقتباس من الكتاب',
      icon: faQuoteRight,
      color: '#4a90e2',
      condition: true
    });

    questions.push({
      id: 6,
      text: '⭐ تقييم الكتاب',
      icon: faStar,
      color: '#f39c12',
      condition: true
    });

    if (book.pages && book.pages > 100) {
      questions.push({
        id: 9,
        text: '📊 تحليل محتوى الكتاب',
        icon: faHashtag,
        color: '#16a085',
        condition: true
      });
    }

    if (book.chapters) {
      questions.push({
        id: 10,
        text: '📑 ما هي فصول الكتاب؟',
        icon: faList,
        color: '#c0392b',
        condition: true
      });
    }

    return questions;
  };

  const availableQuestions = generateDynamicQuestions();

  useEffect(() => {
    if (!isFirstLoad && chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages, isFirstLoad]);

  useEffect(() => {
    if (!isLoadingBook && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, [isLoadingBook]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current && chatContainerRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const fetchBookDetails = async () => {
    try {
      setIsLoadingBook(true);
      const response = await booksService.getBookById(bookId);
      if (response.data.success) {
        setBook(response.data.book);
      }
    } catch (err) {
      console.error('Error fetching book:', err);
      setChatError('فشل في تحميل بيانات الكتاب');
    } finally {
      setIsLoadingBook(false);
    }
  };

  const fetchBookStats = async () => {
    try {
      const response = await booksService.getBookStats(bookId);
      if (response.data.success) {
        setBookStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching book stats:', err);
    }
  };

  const fetchBookQuiz = async () => {
    try {
      const response = await quizService.getQuizByBookId(bookId);
      if (response.data.success) {
        setBookQuiz(response.data.quiz);
      }
    } catch (err) {
      console.error('Error fetching book quiz:', err);
    }
  };

  const generateResponse = (question) => {
    if (!book) return 'جاري تحميل معلومات الكتاب...';

    switch(question) {
      case '📖 عن ماذا يتحدث هذا الكتاب؟':
        return book.description 
          ? `📚 **نبذة عن الكتاب:**\n\n${book.description}`
          : '📚 لا يوجد وصف متاح لهذا الكتاب حالياً.';
      
      case '✍️ من هو المؤلف؟':
        return book.author 
          ? `✍️ **المؤلف:** ${book.author}\n\n${getAuthorInfo(book.author)}`
          : '✍️ معلومات المؤلف غير متوفرة.';
      
      case '📅 ما هي سنة النشر؟':
        return book.published_year 
          ? `📅 **سنة النشر:** ${book.published_year}\n\nهذا الكتاب نُشر منذ ${new Date().getFullYear() - book.published_year} سنة.`
          : '📅 سنة النشر غير معروفة.';
      
      case '📄 كم عدد الصفحات؟':
        return book.pages 
          ? `📄 **عدد الصفحات:** ${book.pages} صفحة\n\n⏱️ **الوقت المقدر للقراءة:** ${Math.ceil(book.pages / 30)} ساعات`
          : '📄 عدد الصفحات غير معروف.';
      
      case '🏷️ ما هو تصنيف الكتاب؟':
        return book.category 
          ? `🏷️ **تصنيف الكتاب:** ${book.category}\n\nهذا التصنيف يشمل كتب تتناول مواضيع مشابهة.`
          : '🏷️ تصنيف الكتاب غير محدد.';
      
      case '🌐 ما هي لغة الكتاب؟':
        return book.language 
          ? `🌐 **لغة الكتاب:** ${book.language}`
          : '🌐 لغة الكتاب غير محددة (يفترض العربية).';
      
      case '💬 اقتباس من الكتاب':
        const quotes = book.quotes || [
          '💭 "القراءة هي متعة العقول"',
          '💭 "الكتب هي الأصدقاء الذين لا يخونون"',
          '💭 "في كل كتاب عالم ينتظر من يكتشفه"',
          '💭 "العلم يبني بيوتاً لا عماد لها والجهل يهدم بيت العز والكرم"'
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
      
      case '⭐ تقييم الكتاب':
        const rating = bookStats?.averageRating || (Math.floor(Math.random() * 2) + 4);
        const reviews = bookStats?.totalReviews || Math.floor(Math.random() * 50) + 10;
        return `⭐ **تقييم الكتاب:** ${rating}/5 نجوم\n📊 **عدد التقييمات:** ${reviews} تقييم`;
      
      case '📊 تحليل محتوى الكتاب':
        return analyzeBookContent(book);
      
      case '📑 ما هي فصول الكتاب؟':
        return book.chapters 
          ? `📑 **فصول الكتاب:**\n${book.chapters.map((ch, i) => `${i+1}. ${ch}`).join('\n')}`
          : '📑 لا توجد معلومات عن فصول الكتاب.';
      
      default:
        return '❓ الرجاء اختيار أحد الخيارات المتاحة.';
    }
  };

  const getAuthorInfo = (authorName) => {
    const authorInfo = {
      'نجيب محفوظ': 'أديب مصري حائز على جائزة نوبل في الأدب',
      'طه حسين': 'أديب وناقد مصري، لقب بعميد الأدب العربي',
      'عباس محمود العقاد': 'أديب ومفكر مصري، صاحب العبقريات'
    };
    
    return authorInfo[authorName] || `المؤلف ${authorName} له إسهامات متعددة في المجال الأدبي.`;
  };

  const analyzeBookContent = (book) => {
    const analysis = [];
    
    if (book.pages) {
      if (book.pages < 100) {
        analysis.push('📋 كتاب قصير، يمكن قراءته في جلسة واحدة');
      } else if (book.pages < 300) {
        analysis.push('📋 كتاب متوسط الطول، مناسب للقراءة خلال أسبوع');
      } else {
        analysis.push('📋 كتاب طويل، يتطلب وقتاً وجهداً للقراءة');
      }
    }
    
    if (book.category) {
      analysis.push(`📚 ينتمي لفئة "${book.category}"`);
    }
    
    if (book.description && book.description.length > 100) {
      analysis.push('💡 يحتوي على وصف مفصل للمحتوى');
    }
    
    return `📊 **تحليل الكتاب:**\n\n${analysis.join('\n')}`;
  };

  const handleQuestionSelect = (questionText) => {
    setShowQuestions(false);
    setIsLoading(true);
    setChatError(null);

    const userMessage = {
      id: Date.now(),
      text: questionText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const response = generateResponse(questionText);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleNewQuestion = () => {
    setShowQuestions(true);
  };

  if (isLoadingBook) {
    return (
      <motion.div 
        className="chat-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FontAwesomeIcon icon={faSpinner} className="chat-spinner" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          جاري تحميل الكتاب...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="chat-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div 
        ref={chatHeaderRef}
        className="chat-header"
        variants={chatSlideVariants}
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
        custom="right"
      >
        <motion.button 
          className="chat-back-btn" 
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </motion.button>
        
        <motion.div 
          className="chat-book-info"
          variants={chatContainerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
        >
          <motion.div 
            className="chat-book-icon"
            variants={chatScaleVariants}
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <FontAwesomeIcon icon={faBookOpen} />
          </motion.div>
          <motion.div variants={chatItemVariants}>
            <motion.h2 variants={chatItemVariants}>{book?.title || 'الكتاب'}</motion.h2>
            <motion.p variants={chatItemVariants}>{book?.author || 'المؤلف'}</motion.p>
            {book?.category && (
              <motion.span 
                className="chat-category-badge"
                variants={chatItemVariants}
                whileHover={{ scale: 1.05 }}
              >
                {book.category}
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        {book?.file_url && (
          <motion.a 
            href={`http://localhost:3001${book.file_url}`}
            target="_blank"
            rel="noreferrer"
            className="chat-pdf-btn"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FontAwesomeIcon icon={faFilePdf} />
          </motion.a>
        )}
      </motion.div>

      {/* Messages Container */}
      <div className="chat-messages-container" ref={chatContainerRef}>
        {/* Questions Section */}
        <AnimatePresence mode="wait">
          {showQuestions && (
            <motion.div 
              ref={chatWelcomeRef}
              key="questions"
              className="chat-questions-section"
              variants={chatScaleVariants}
              initial="hidden"
              animate={welcomeInView ? "visible" : "hidden"}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="chat-welcome-card"
                variants={chatStaggerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div 
                  className="chat-welcome-icon-wrapper"
                  variants={chatItemVariants}
                >
                  <FontAwesomeIcon icon={faRobot} className="chat-welcome-icon" />
                </motion.div>
                
                <motion.h3 variants={chatItemVariants}>مرحباً بك في محادثة AI</motion.h3>
                <motion.p variants={chatItemVariants}>
                  اختر أحد الخيارات التالية للتحدث عن كتاب "{book?.title}"
                </motion.p>
                
                {book && (
                  <motion.div 
                    className="chat-stats-mini"
                    variants={chatItemVariants}
                  >
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📊 {availableQuestions.length} سؤال متاح
                    </motion.span>
                    {book.pages && (
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📄 {book.pages} صفحة
                      </motion.span>
                    )}
                    {book.published_year && (
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📅 {book.published_year}
                      </motion.span>
                    )}
                  </motion.div>
                )}
                
                <motion.div 
                  ref={chatQuestionsGridRef}
                  className="chat-questions-grid"
                  variants={chatContainerVariants}
                  initial="hidden"
                  animate={questionsGridInView ? "visible" : "hidden"}
                >
                  {availableQuestions.map((q, index) => (
                    <motion.button
                      key={q.id}
                      className="chat-question-btn"
                      onClick={() => handleQuestionSelect(q.text)}
                      variants={chatItemVariants}
                      custom={index}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: `0 10px 20px ${q.color}40`,
                        borderColor: q.color,
                        backgroundColor: `${q.color}15`
                      }}
                      whileTap={{ scale: 0.95 }}
                      style={{ 
                        borderColor: q.color,
                        background: `linear-gradient(135deg, ${q.color}10, ${q.color}20)`
                      }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                      >
                        <FontAwesomeIcon icon={q.icon} style={{ color: q.color }} />
                      </motion.div>
                      <span>{q.text}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages List */}
        <motion.div 
          className="chat-messages-list"
          ref={chatMessagesRef}
          variants={chatStaggerVariants}
          initial="hidden"
          animate={messagesInView ? "visible" : "hidden"}
        >
          <AnimatePresence mode="popLayout">
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`chat-message ${msg.sender === 'user' ? 'chat-user-message' : 'chat-ai-message'}`}
                variants={chatMessageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                {msg.sender === 'ai' && (
                  <motion.div 
                    className="chat-ai-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <FontAwesomeIcon icon={faRobot} />
                    <span>AI</span>
                  </motion.div>
                )}
                
                <motion.div 
                  className="chat-message-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.p 
                    className="chat-message-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {msg.text}
                  </motion.p>
                  <motion.div 
                    className="chat-message-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="chat-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="chat-typing-indicator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <motion.div 
                className="chat-typing-dots"
                animate="animate"
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.2
                    }
                  }
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    variants={{
                      animate: {
                        y: [0, -10, 0],
                        transition: {
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2
                        }
                      }
                    }}
                  />
                ))}
              </motion.div>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                AI يكتب...
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Error Message */}
        <AnimatePresence>
          {chatError && (
            <motion.div 
              className="chat-error-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>{chatError}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* New Question Button */}
        <AnimatePresence>
          {!showQuestions && chatMessages.length > 0 && (
            <motion.div 
              className="chat-new-question-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <motion.button
                className="chat-new-question-btn"
                onClick={handleNewQuestion}
                whileHover={{ scale: 1.05, backgroundColor: '#2c5c34' }}
                whileTap={{ scale: 0.95 }}
                initial={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                animate={{ 
                  boxShadow: ['0 4px 10px rgba(0,0,0,0.1)', '0 8px 20px rgba(44,92,52,0.3)', '0 4px 10px rgba(0,0,0,0.1)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <FontAwesomeIcon icon={faRedoAlt} />
                </motion.div>
                سؤال جديد
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Disabled Input */}
      <motion.div 
        className="chat-input-disabled"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.p
          animate={{ 
            scale: [1, 1.02, 1],
            color: ['#666', '#2c5c34', '#666']
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          📌 اختر من الأسئلة المتاحة أعلاه للاستفسار عن الكتاب
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default ChatPage;