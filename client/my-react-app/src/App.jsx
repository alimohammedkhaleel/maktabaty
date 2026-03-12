import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/loadingComponent/LoadingScreen';
import LibraryPresentation from './components/library-presentation/LibraryPresentation';
import Navbar from './components/navComponent/Navbar';
import LoginRegister from './components/authComponent/LoginRegister';
import AdminDashboard from './components/adminComponent/AdminDashboard';
import ClientLibrary from './components/clientComponent/ClientLibrary';
import QuizList from './components/quizComponent/QuizList';
import QuizPage from './components/quizComponent/QuizPage';
import Leaderboard from './components/quizComponent/Leaderboard';
import GlobalLeaderboard from './components/quizComponent/GlobalLeaderboard';
import Home from './pages/Home';
import ChatPage from './components/clientComponent/ChatPage';
import useAuthStore from './store/authStore';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main Content after login - shows Home first, then ClientLibrary on /books
const MainContent = ({ showHome }) => {
  if (showHome) {
    return <Home />;
  }
  return (
    <>
      <Navbar />
      <ClientLibrary />
    </>
  );
};

// مكون للتحقق مما إذا كنا في صفحة المحادثة أو الصفحة الرئيسية
const PageLayout = ({ children }) => {
  const location = useLocation();
  // إخفاء الـ Navbar في صفحة المحادثة والصفحة الرئيسية
  const isChatPage = location.pathname.startsWith('/chat/');
  const isHomePage = location.pathname === '/';
  
  // لا نظهر الـ Navbar إذا كنا في صفحة المحادثة أو الصفحة الرئيسية
  const shouldHideNavbar = isChatPage || isHomePage;
  
  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPresentation, setShowPresentation] = useState(true);
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication on app load (only once)
  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    init();
  }, []);

  // Hide presentation when user is authenticated or on specific routes
  useEffect(() => {
    if (isAuthenticated || location.pathname === '/login' || showPresentation === false) {
      setShowPresentation(false);
    }
  }, [isAuthenticated, location.pathname]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handlePresentationComplete = () => {
    setShowPresentation(false);
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {showPresentation && !isAuthenticated && location.pathname === '/' && (
          <LibraryPresentation 
            key="presentation"
            onComplete={handlePresentationComplete} 
          />
        )}
      </AnimatePresence>
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginRegister />
            )
          } 
        />
        
        {/* Home Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              // If admin, redirect to /admin
              user?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <PageLayout>
                  <MainContent showHome={true} />
                </PageLayout>
              )
            ) : (
              showPresentation && location.pathname === '/' ? null : <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Books Route */}
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <PageLayout>
                <ClientLibrary />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Chat Route - بدون Navbar */}
        <Route
          path="/chat/:bookId"
          element={
            <ProtectedRoute>
              {/* ملاحظة: هنا مش بنستخدم PageLayout عشان منعرضش Navbar ولكن PageLayout هيتعامل معاه تلقائياً */}
              <PageLayout>
                <ChatPage />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Quiz routes for users */}
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <PageLayout>
                <QuizList />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id"
          element={
            <ProtectedRoute>
              <PageLayout>
                <QuizPage />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id/leaderboard"
          element={
            <ProtectedRoute>
              <PageLayout>
                <Leaderboard />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        {/* global leaderboard accessible to all users */}
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <PageLayout>
                <GlobalLeaderboard />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredRole="admin">
                <PageLayout>
                  <AdminDashboard />
                </PageLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;