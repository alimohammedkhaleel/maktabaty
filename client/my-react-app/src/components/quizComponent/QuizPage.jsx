import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/apppi'; // ✅ التعديل هنا
import './Quiz.css';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // handler for option selection
  const handleOptionChange = (questionId, index) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: Number(index)  // تأكد من أنها رقم
    }));
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.authRequest(`/quizzes/${id}`, { method: 'GET' }); // ✅ استخدم api
        
        if (res.success) { // ✅ تعديل هنا
          setQuiz(res.quiz);
          // initialize answers for all questions with -1 (not answered)
          const emptyAnswers = {};
          res.quiz.questions.forEach(q => {
            emptyAnswers[q.id] = -1;  // -1 يعني لم يتم الاختيار
          });
          setAnswers(emptyAnswers);
        }
      } catch (err) {
        setError('فشل تحميل الاختبار');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const allAnswered = quiz && 
                      Object.keys(answers).length === quiz.questions.length && 
                      Object.values(answers).every(v => v !== -1 && v !== null);

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('يجب الإجابة على جميع الأسئلة');
      return;
    }
    const answerArray = Object.entries(answers)
      .filter(([_, val]) => val !== -1 && val !== null)
      .map(([question_id, answerIndex]) => ({
        question_id: parseInt(question_id),
        answerIndex: Number(answerIndex)
      }));
    
    try {
      setLoading(true);
      const res = await api.authRequest(`/quizzes/${id}/submit`, { // ✅ استخدم api
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray })
      });
      
      console.log('[QUIZPAGE] submit response', res);
      if (res.success) { // ✅ تعديل هنا
        setResult(res); // contains score, rank, bonus, totalQuestions
      } else {
        setError(res.message || 'فشل إرسال الأجوبة');
      }
    } catch (err) {
      console.error('[QUIZPAGE] submit error', err);
      setError(err.message || 'فشل إرسال الأجوبة');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !quiz) return <p>جاري التحميل...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!quiz) return null;

  if (result !== null) {
    return (
      <div className="quiz-page">
        <h2>نتيجة الاختبار</h2>
        <p>لقد حصلت على {result.score} نقطة{result.score !== 1 ? 'ات' : ''}.</p>
        {result.rank != null && (
          <>
            <p>ترتيبك: {result.rank}</p>
            <p>نقاط إضافية: {result.bonus}</p>
          </>
        )}
        <button className="btn-submit-quiz" onClick={() => navigate(`/quizzes/${id}/leaderboard`)}>
          عرض الترتيب
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <h2>{quiz.title}</h2>
      <div className="quiz-questions">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="question">
            <p>{idx + 1}. {q.question}</p>
            <ul className="options">
              {q.options.map((opt, i) => (
                <motion.li
                  key={i}
                  initial={{ scale: 1 }}
                  animate={answers[q.id] === i ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <label>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={i}
                      checked={answers[q.id] === i}
                      onChange={() => handleOptionChange(q.id, i)}
                    />
                    {opt}
                  </label>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <motion.button
        className="btn-submit-quiz"
        onClick={handleSubmit}
        disabled={loading || Object.keys(answers).length < quiz.questions.length}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {loading ? '⏳ جاري...' : 'إنهاء الاختبار'}
      </motion.button>
    </div>
  );
};

export default QuizPage;