import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/apppi'; // ✅ التعديل هنا
import './Quiz.css';

const Leaderboard = () => {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.authRequest(`/quizzes/${id}/leaderboard`, { method: 'GET' }); // ✅ استخدم api
        
        if (res.success) { // ✅ تعديل هنا
          setLeaderboard(res.leaderboard);
        }
      } catch (err) {
        setError('فشل تحميل الترتيب');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return (
    <div className="leaderboard-page">
      <h2>الترتيب</h2>
      {loading && <p>جاري التحميل...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && leaderboard.length === 0 && <p>لا توجد نتائج بعد.</p>}
      {leaderboard.length > 0 && (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>الترتيب</th>
              <th>المستخدم</th>
              <th>النقاط</th>
              <th>نقاط إضافية</th>
              <th>المجموع</th>
              <th>الوقت</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, idx) => (
              <tr key={row.user_id + '-' + idx}>
                <td>{idx + 1}</td>
                <td>{row.username || 'مجهول'}</td>
                <td>{row.score}</td>
                <td>{row.bonus || 0}</td>
                <td>{row.totalPoints || row.score}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;