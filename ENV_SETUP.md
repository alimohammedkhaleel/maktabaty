# متطلبات البيئة والإعدادات

## 🔐 ملف .env للـ Server

أنشئ ملف `.env` في مجلد `server/`:

```env
# قاعدة البيانات
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306
DB_NAME=library_db

# JWT
JWT_SECRET=your-secret-key-here-change-in-production

# OpenAI (اختياري)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# البيئة
ENVIRONMENT=development
PORT=3001
```

## 🔑 كيفية الحصول على OpenAI API Key

1. ادخل https://platform.openai.com
2. سجل أو ادخل حسابك
3. اذهب إلى API Keys → Create new secret key
4. انسخ المفتاح وضعه في `.env`

## 🚀 بدء التشغيل

### Backend
```bash
cd server
npm install
node scripts/createQuizTables.js  # إنشاء الجداول
npm run dev                        # تشغيل
```

### Frontend
```bash
cd client/my-react-app
npm run dev  # تشغيل على http://localhost:5173
```

## 📦 Dependencies المثبتة

### Server
- express
- mysql2/promise
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- multer (رفع الملفات)
- pdf-parse (قراءة PDF)
- openai (توليد الأسئلة)

### Client
- react
- react-router-dom
- framer-motion
- gsap
- zustand (state management)
- axios
- fontawesome

## ✅ التحقق من التثبيت

```bash
# اختبر Backend
curl http://localhost:3001/api/health

# اختبر Frontend
curl http://localhost:5173
```

يجب أن ترى:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-28T..."
}
```

## 🔧 إذا واجهت مشاكل

### خطأ "Port in use"
```bash
# للـ Windows
npx kill-port 3001
npx kill-port 5173

# للـ Mac/Linux
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill
```

### خطأ "Module not found"
```bash
npm install
# أو
npm install --force
```

### خطأ Database Connection
- تأكد أن MySQL جاري التشغيل
- تحقق من بيانات الوصول في `.env`

---

**النظام الآن جاهز تماماً! 🎉**
