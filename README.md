# 📚 مشروع مكتبة الأخلاق الرقمية - نظام متكامل للمصادقة والإدارة والذكاء الاصطناعي

## ✨ المميزات الرئيسية

- 🔐 **نظام مصادقة آمن** - تسجيل دخول وتسجيل مستخدمين مع تشفير bcryptjs
- 📚 **إدارة الكتب** - CRUD كامل لإضافة وتعديل وحذف الكتب
- 🤖 **نموذج AI** - نظام أسئلة وأجوبة ذكي يعتمد على محتوى الكتب
- 🎨 **واجهة جميلة** - تصميم عصري مع Framer Motion و GSAP animations
- 👥 **إدارة المستخدمين** - نظام الأدوار (Admin, User)
- ⭐ **المفضلة** - حفظ الكتب المفضلة للمستخدم
- 📱 **Responsive Design** - تصميم متجاوب مع جميع الأجهزة

---

## 🛠️ متطلبات التثبيت

### الخادم
- Node.js 14+
- MySQL 5.7+
- npm أو yarn

### العميل
- React 19+
- npm أو yarn

---

## 📦 التثبيت والإعداد

### 1️⃣ إعداد قاعدة البيانات

```bash
# استخدم أي أداة MySQL (MySQL Workbench, phpMyAdmin, etc.)
# أو قم بتشغيل الخادم - سيقوم تلقائياً بإنشاء قاعدة البيانات النطلوبة
```

**متغيرات البيئة في .env:**
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=  
DB_NAME=library_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
ENVIRONMENT=development
```

### 2️⃣ تثبيت المكتبات

#### الخادم
```bash
cd server
npm install
```

#### العميل
```bash
cd client/my-react-app
npm install
```

### 3️⃣ تشغيل الخادم

```bash
cd server
npm run dev
```

الخادم سيعمل على `http://localhost:3001`

### 4️⃣ تشغيل تطبيق React

```bash
cd client/my-react-app
npm run dev
```

التطبيق سيعمل على `http://localhost:5173`

---

## 📁 بنية المشروع

```
مكتبتي/
├── server/
│   ├── config/
│   │   ├── db.js                 # إعدادات قاعدة البيانات
│   │   └── initDB.js             # تهيئة قاعدة البيانات
│   ├── middleware/
│   │   └── auth.js               # Middleware للمصادقة والتحقق
│   ├── controllers/
│   │   ├── authController.js     # منطق التسجيل والدخول
│   │   ├── booksController.js    # منطق إدارة الكتب
│   │   └── aiController.js       # منطق نموذج الـ AI
│   ├── routes/
│   │   ├── authRoutes.js         # مسارات المصادقة
│   │   ├── booksRoutes.js        # مسارات الكتب
│   │   └── aiRoutes.js           # مسارات الـ AI
│   ├── .env                       # متغيرات البيئة
│   ├── index.js                   # الملف الرئيسي للخادم
│   └── package.json
│
└── client/my-react-app/
    ├── src/
    │   ├── components/
    │   │   ├── authComponent/
    │   │   │   ├── Auth.jsx       # مكون المصادقة
    │   │   │   └── Auth.css
    │   │   ├── adminComponent/
    │   │   │   ├── AdminDashboard.jsx  # لوحة التحكم
    │   │   │   └── AdminDashboard.css
    │   │   ├── clientComponent/
    │   │   │   ├── ClientLibrary.jsx   # مكتبة العميل + AI
    │   │   │   └── ClientLibrary.css
    │   │   ├── navComponent/
    │   │   │   └── Navbar.jsx
    │   │   ├── loadingComponent/
    │   │   └── library-presentation/
    │   ├── services/
    │   │   ├── api.js             # إعدادات Axios
    │   │   └── authService.js     # استدعاءات الـ API
    │   ├── store/
    │   │   ├── authStore.js       # إدارة الحالة - المصادقة
    │   │   └── booksStore.js      # إدارة الحالة - الكتب
    │   ├── App.jsx                # الملف الرئيسي
    │   └── main.jsx
    └── package.json
```

---

## 🔌 واجهات API الرئيسية

### المصادقة
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile
```

### الكتب
```
GET /api/books
GET /api/books/:id
POST /api/books
PUT /api/books/:id
DELETE /api/books/:id
GET /api/books/search?query=...
POST /api/books/favorites/add
DELETE /api/books/favorites/:id
```

### الذكاء الاصطناعي
```
POST /api/ai/ask
GET /api/ai/history
GET /api/ai/auto-questions/:book_id
GET /api/ai/search?query=...
```

---

## 🔐 أنظمة الأمان

- ✅ **تشفير كلمات المرور** باستخدام bcryptjs
- ✅ **JWT Tokens** لمصادقة آمنة
- ✅ **CORS Configuration** للحماية من الهجمات العابرة
- ✅ **SQL Injection Prevention** من خلال parameterized queries
- ✅ **Role-Based Access Control** (RBAC)

---

## 🎨 التصميم والرسوميات

### الألوان
- **اللون الأساسي:** `#2c5c34` (أخضر غامق)
- **اللون الفاتح:** `#3d7d42` (أخضر فاتح)
- **اللون الذهبي:** `#d4af37` (لهجات)
- **خلفية فاتحة:** `#f5f7f3`

### الـ Animations
- استخدام **Framer Motion** للدخول والخروج السلس
- استخدام **GSAP** للتأثيرات المتقدمة
- **Intersection Observer** لتحميل الصور بكفاءة
- **Parallax Effects** في العناصر الرئيسية

---

## 👤 أنواع المستخدمين

### 1. مستخدم عادي (User)
- يمكنه العثور على الكتب والبحث عنها
- يمكنه طرح الأسئلة على نموذج الـ AI
- يمكنه إضافة الكتب للمفضلة
- لا يمكنه الوصول إلى لوحة التحكم

### 2. مسؤول (Admin)
- كل صلاحيات المستخدم العادي
- يمكنه إضافة وتعديل وحذف الكتب
- الوصول إلى لوحة التحكم المتقدمة
- إدارة المستخدمين

---

## 🤖 نموذج الذكاء الاصطناعي

النموذج الحالي بسيط لكن قابل للتطور:

### المميزات الحالية:
- التعرف على الكلمات الرئيسية في الأسئلة
- توليد إجابات ذكية بناءً على بيانات الكتاب
- حفظ سجل الأسئلة والإجابات
- توليد أسئلة تلقائية للكتب

### يمكن التطوير باستخدام:
- **TensorFlow.js** - للمعالجة المحلية
- **OpenAI API** - للنتائج أفضل
- **Hugging Face** - لنماذج NLP متقدمة

---

## 📊 جداول قاعدة البيانات

### users
```sql
id, username, email, password, role, avatar_url, created_at, updated_at
```

### books
```sql
id, title, author, description, file_url, category, published_year, pages, 
cover_url, created_by, created_at, updated_at
```

### qa_history
```sql
id, user_id, book_id, question, answer, confidence, created_at
```

### favorites
```sql
id, user_id, book_id, created_at
```

---

## 🚀 خطوات التشغيل السريعة

```bash
# 1. استنساخ المشروع
cd "e:/revision of html , css , java script/مكتبتي"

# 2. تثبيت المكتبات
cd server && npm install
cd ../client/my-react-app && npm install

# 3. تشغيل الخادم (في terminal منفصل)
cd ../../server && npm run dev

# 4. تشغيل العميل (في terminal آخر)
cd client/my-react-app && npm run dev

# 5. افتح المتصفح
# Server: http://localhost:3001
# Client: http://localhost:5173
```

---

## 🐛 استكشاف الأخطاء

### مشكلة الاتصال بـ MySQL
```bash
# تأكد من تشغيل MySQL
# تحقق من متغيرات البيئة في .env
# تأكد من أن كلمة المرور صحيحة
```

### مشكلة الـ CORS
```bash
# تأكد من أن عنوان الـ URL صحيح في api.js
# تحقق من إعدادات CORS في index.js
```

### مشكلة الـ Routing
```bash
# قم بتثبيت react-router-dom
npm install react-router-dom
```

---

## 📝 ملاحظات مهمة

- ⚠️ غير JWT_SECRET في الإنتاج
- 🔒 استخدم HTTPS في الإنتاج
- 📱 اختبر على أجهزة مختلفة
- 🧪 أضف المزيد من الاختبارات
- 📚 وثق التعديلات الإضافية

---

## 👨‍💻 التطوير المستقبلي

- [ ] إضافة upload الملفات (PDF)
- [ ] استخراج النصوص من الملفات
- [ ] نموذج AI متقدم
- [ ] نظام التعليقات والتقييمات
- [ ] البحث المتقدم مع الفلاتر
- [ ] نظام الإشعارات
- [ ] التصدير إلى PDF
- [ ] TDD وكتابة الاختبارات

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تحقق من ملف .env
2. تأكد من تشغيل جميع الخدمات
3. تفقد console للأخطاء
4. تحقق من اتصال قاعدة البيانات

---

**تم الإنشاء بـ ❤️ - 2026**
