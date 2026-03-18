// config.js - ملف مركزي لجميع المتغيرات
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY,
  
  // هل نحن في بيئة الإنتاج؟
  isProduction: process.env.REACT_APP_ENVIRONMENT === 'production',
};

export default config;