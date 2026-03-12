import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { quizService } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import './Quiz.css';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await quizService.listQuizzes();
        if (res.data.success) {
          setQuizzes(res.data.quizzes);
        }
      } catch (err) {
        setError('حدث خطأ أثناء جلب الاختبارات');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleTake = (quiz) => {
    navigate(`/quizzes/${quiz.id}`);
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      console.error('delete quiz error', err);
      setError('فشل حذف الكويز');
    }
  };

  return (
    <div className="quiz-list">
      <h2>الاختبارات المتاحة</h2>
      {loading && <p>جاري التحميل...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && quizzes.length === 0 && <p>لا توجد اختبارات منشورة.</p>}
      <div className="cards">
        {quizzes.map((q) => (
          <motion.div key={q.id} className="quiz-card" whileHover={{ scale: 1.02 }}>
            <h3>{q.title}</h3>
            {q.book_title && <p>📚 {q.book_title}</p>}
            <motion.button
              className="btn-take"
              onClick={() => handleTake(q)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ابدأ الاختبار
            </motion.button>
            {user?.role === 'admin' && (
              <motion.button
                className="btn-delete-quiz"
                onClick={() => handleDelete(q.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                حذف
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuizList;
