import React, { useState, useEffect, useRef } from 'react';
import { quizService } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import './Quiz.css';

const GlobalLeaderboard = () => {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const { user, updateUser } = useAuthStore();
  const celebrationShown = useRef(false);
  const initialLoadDone = useRef(false); // للتأكد من تحميل البيانات أولاً

  // جلب البيانات - يتم تشغيله مرة واحدة فقط
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await quizService.getGlobalLeaderboard();
        
        if (res.data.success) {
          setBoard(res.data.leaderboard || []);
        } else {
          setError(res.data.message || 'فشل تحميل الأوائل');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'فشل تحميل الأوائل');
      } finally {
        setLoading(false);
        initialLoadDone.current = true;
      }
    };

    fetchLeaderboard();
  }, []);

  // تحديث بيانات المستخدم - مع شرط المقارنة لمنع الحلقة اللانهائية
  useEffect(() => {
    // التأكد من اكتمال التحميل ووجود البيانات
    if (!initialLoadDone.current || !user || !updateUser || board.length === 0) return;

    const userIndex = board.findIndex(
      r => String(r.user_id) === String(user.id) || r.username === user.username
    );

    if (userIndex !== -1) {
      const userData = board[userIndex];
      const newRank = userIndex + 1;
      const newPoints = userData.total_score || user.totalPoints;

      // ✅ الأهم: التحقق من تغير القيم قبل التحديث
      const rankChanged = user.globalRank !== newRank;
      const pointsChanged = user.totalPoints !== newPoints;

      // تحديث فقط إذا تغيرت القيم فعلاً
      if (rankChanged || pointsChanged) {
        updateUser({
          ...user,
          totalPoints: newPoints,
          globalRank: newRank
        });
      }

      // إظهار التهنئة للمراكز الثلاثة الأولى (مرة واحدة فقط)
      if (userIndex < 3 && !celebrationShown.current) {
        setShowCelebration(true);
        celebrationShown.current = true;
        
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } else if (user.globalRank !== null) {
      // إذا لم يكن المستخدم في القائمة، نحدث فقط إذا كان مختلفاً
      updateUser({ ...user, globalRank: null });
    }
  }, [board, user, updateUser]); // نفس التبعيات لكن مع شرط المقارنة

  // تنسيق النقاط
  const formatPoints = (points) => {
    return points?.toLocaleString('ar-EG') || '0';
  };

  // أيقونة المركز
  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  return (
    <div className="leaderboard-page">
      <h2>🏆 الأوائل على مستوى الموقع 🏆</h2>

      {/* رسالة التهنئة */}
      {showCelebration && (
        <div className="celebration-toast">
          🎉 مبروك! أنت من الأوائل! 🎉
        </div>
      )}

      {/* حالة التحميل */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* لا توجد بيانات */}
      {!loading && board.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-text">لا توجد بيانات بعد</p>
          <p className="empty-subtext">كن أول من يشارك في المسابقات!</p>
        </div>
      )}

      {/* جدول الأوائل */}
      {board.length > 0 && (
        <>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>المستخدم</th>
                <th>النقاط</th>
              </tr>
            </thead>
            <tbody>
              {board.map((row, index) => {
                const isCurrentUser = user && 
                  (String(row.user_id) === String(user.id) || row.username === user.username);
                const rankIcon = getRankIcon(index);

                return (
                  <tr 
                    key={row.user_id || index}
                    className={isCurrentUser ? 'current-user' : ''}
                  >
                    <td>
                      {index + 1}
                      {rankIcon && <span style={{ marginRight: '5px' }}>{rankIcon}</span>}
                    </td>
                    <td>
                      {row.username || 'مجهول'}
                      {isCurrentUser && <span style={{ marginRight: '5px', color: '#2c5c34' }}>(أنت)</span>}
                    </td>
                    <td>{formatPoints(row.total_score)} نقطة</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ملخص المستخدم - يظهر فقط إذا كان المستخدم في القائمة */}
          {user && user.globalRank && (
            <div className="user-summary">
              <div className="summary-card">
                <p>
                  ترتيبك: 
                  <strong className={user.globalRank <= 3 ? 'top-rank' : ''}>
                    #{user.globalRank}
                    {user.globalRank <= 3 && ' 🏆'}
                  </strong>
                </p>
                <p>
                  نقاطك: 
                  <strong>{formatPoints(user.totalPoints)}</strong>
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GlobalLeaderboard;