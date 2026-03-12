import apiInstance from './api';

// المصادقة
export const authService = {
  register: (username, email, password, confirmPassword) =>
    apiInstance.post('/auth/register', { username, email, password, confirmPassword }),
  
  login: (email, password) =>
    apiInstance.post('/auth/login', { email, password }),
  
  getProfile: () =>
    apiInstance.get('/auth/profile'),
  
  updateProfile: (username, avatar_url) =>
    apiInstance.put('/auth/profile', { username, avatar_url }),
};

// الكتب
export const booksService = {
  getAllBooks: () =>
    apiInstance.get('/books'),
  
  getBook: (id) =>
    apiInstance.get(`/books/${id}`),
  
  searchBooks: (query) =>
    apiInstance.get('/books/search', { params: { query } }),
  
  addBook: (bookData) =>
    // if bookData is FormData (contains file), send multipart request
    (bookData instanceof FormData ? apiInstance.post('/books', bookData, { headers: { 'Content-Type': 'multipart/form-data' } }) : apiInstance.post('/books', bookData)),
  
  updateBook: (id, bookData) =>
    apiInstance.put(`/books/${id}`, bookData),
  
  deleteBook: (id) =>
    apiInstance.delete(`/books/${id}`),
  
  addToFavorites: (book_id) =>
    apiInstance.post('/books/favorites/add', { book_id }),
  
  removeFromFavorites: (book_id) =>
    apiInstance.delete(`/books/favorites/${book_id}`),
};

// الـ AI
export const aiService = {
  askQuestion: (question, book_id) =>
    apiInstance.post('/ai/ask', { question, book_id }),
  
  getQAHistory: () =>
    apiInstance.get('/ai/history'),
  
  generateAutoQuestions: (book_id) =>
    apiInstance.get(`/ai/auto-questions/${book_id}`),
  
  searchInBooks: (query) =>
    apiInstance.get('/ai/search', { params: { query } }),
};

export const quizService = {
  // admin actions
  createQuiz: (book_id) => apiInstance.post('/quizzes', { book_id }),
  generateQuiz: async (book_id) => {
    console.log('[FRONTEND] generateQuiz called with book_id:', book_id);
    try {
      const response = await apiInstance.post(`/quizzes/generate/${book_id}`);
      console.log('[FRONTEND] generateQuiz response:', response);
      return response;
    } catch (err) {
      console.error('[FRONTEND] generateQuiz error:', err);
      throw err;
    }
  },
  publishQuiz: (quiz_id) => apiInstance.post(`/quizzes/publish/${quiz_id}`),
  // question management
  updateQuestion: (question_id, data) => apiInstance.put(`/quizzes/question/${question_id}`, data),
  deleteQuestion: (question_id) => apiInstance.delete(`/quizzes/question/${question_id}`),
  addQuestion: (quiz_id, data) => apiInstance.post(`/quizzes/${quiz_id}/question`, data),
  regenerateQuiz: (quiz_id) => apiInstance.post(`/quizzes/regenerate/${quiz_id}`),
  // student actions
  listQuizzes: () => apiInstance.get(`/quizzes`),
  listAllQuizzes: () => apiInstance.get(`/quizzes/all`),
  getGlobalLeaderboard: () => apiInstance.get(`/quizzes/global-leaderboard`),
  getQuiz: (quiz_id) => apiInstance.get(`/quizzes/${quiz_id}`),
  submitQuiz: (quiz_id, answers) => apiInstance.post(`/quizzes/submit/${quiz_id}`, { answers }),
  getLeaderboard: (quiz_id) => apiInstance.get(`/quizzes/leaderboard/${quiz_id}`),
  deleteQuiz: (quiz_id) => apiInstance.delete(`/quizzes/${quiz_id}`),
};
