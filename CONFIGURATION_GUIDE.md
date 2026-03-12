# ⚙️ دليل الإعدادات والمتغيرات

## 📝 جدول المحتويات

1. [متغيرات البيئة](#متغيرات-البيئة)
2. [إعدادات قاعدة البيانات](#إعدادات-قاعدة-البيانات)
3. [إعدادات الخادم](#إعدادات-الخادم)
4. [إعدادات العميل](#إعدادات-العميل)
5. [متغيرات CSS](#متغيرات-css)
6. [أمثلة الإعدادات](#أمثلة-الإعدادات)

---

## 🌍 متغيرات البيئة

### ملف `.env` في مجلد `server/`

```env
# ========================
# الخادم
# ========================
PORT=3001
ENVIRONMENT=development

# ========================
# قاعدة البيانات
# ========================
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=library_db
DB_PORT=3306

# ========================
# الأمان والمصادقة
# ========================
JWT_SECRET=your_very_long_and_complex_secret_key_min_32_chars
JWT_EXPIRE=7d

# ========================
# البريد الإلكتروني (اختياري)
# ========================
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# ========================
# خدمات خارجية (اختياري)
# ========================
OPENAI_API_KEY=sk_...your_openai_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### ملف `.env.example` (نسخة آمنة للنشر العام)

```env
# ========================
# الخادم
# ========================
PORT=3001
ENVIRONMENT=production

# ========================
# قاعدة البيانات
# ========================
DB_HOST=your-database-host.com
DB_USER=your_db_user
DB_PASSWORD=your_strong_password
DB_NAME=library_db_prod
DB_PORT=3306

# ========================
# الأمان والمصادقة
# ========================
JWT_SECRET=your_very_long_complex_secret_key_change_me
JWT_EXPIRE=7d

# ========================
# البريد الإلكتروني
# ========================
EMAIL_SERVICE=gmail
EMAIL_USER=library@yourdomain.com
EMAIL_PASSWORD=your_app_password

# ========================
# خدمات خارجية
# ========================
OPENAI_API_KEY=sk_...
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🗄️ إعدادات قاعدة البيانات

### معلومات الاتصال الافتراضية

```
المضيف (Host): localhost
المنفذ (Port): 3306
اسم المستخدم: root
كلمة السر: (اترك فارغ أو ادخل كلمتك)
اسم قاعدة البيانات: library_db
```

### جداول قاعدة البيانات

#### جدول المستخدمين (users)

```
الحقل          | النوع         | الحد الأقصى | ملاحظات
id             | INT           | -          | مفتاح أساسي (Primary Key)
username       | VARCHAR       | 100        | فريد (Unique)
email          | VARCHAR       | 100        | فريد (Unique)
password_hash  | VARCHAR       | 255        | مشفر (Hashed)
role           | ENUM          | -          | 'user' أو 'admin'
avatar_url     | VARCHAR       | 500        | اختياري
created_at     | TIMESTAMP     | -          | تاريخ الإنشاء
updated_at     | TIMESTAMP     | -          | تاريخ التحديث
```

#### جدول الكتب (books)

```
الحقل           | النوع         | الحد الأقصى | ملاحظات
id              | INT           | -          | مفتاح أساسي
title           | VARCHAR       | 255        | مفهرس للبحث
author          | VARCHAR       | 100        | مفهرس للبحث
description     | TEXT          | -          | فهرس نصي (FULLTEXT)
category        | VARCHAR       | 50         | للتصنيف
published_year  | YEAR          | -          | السنة
pages           | INT           | -          | عدد الصفحات
cover_url       | VARCHAR       | 500        | رابط الصورة
file_url        | VARCHAR       | 500        | رابط ملف PDF
created_by      | INT (FK)      | -          | مفتاح خارجي (users.id)
created_at      | TIMESTAMP     | -          | تاريخ الإنشاء
updated_at      | TIMESTAMP     | -          | تاريخ التحديث
```

#### جدول سجل الأسئلة والأجوبة (qa_history)

```
الحقل              | النوع         | الحد الأقصى | ملاحظات
id                 | INT           | -          | مفتاح أساسي
user_id            | INT (FK)      | -          | مفتاح خارجي (users.id)
book_id            | INT (FK)      | -          | مفتاح خارجي (books.id)
question           | TEXT          | -          | السؤال
answer             | TEXT          | -          | الإجابة
confidence_score   | FLOAT         | 0-1        | درجة الثقة
created_at         | TIMESTAMP     | -          | وقت الإنشاء
```

#### جدول المفضلة (favorites)

```
الحقل          | النوع         | الحد الأقصى | ملاحظات
id             | INT           | -          | مفتاح أساسي
user_id        | INT (FK)      | -          | مفتاح خارجي (users.id)
book_id        | INT (FK)      | -          | مفتاح خارجي (books.id)
created_at     | TIMESTAMP     | -          | تاريخ الإضافة
UNIQUE         | (user_id, book_id) | -     | منع التكرار
```

---

## 🖥️ إعدادات الخادم

### الملف: `server/index.js`

```javascript
// إعدادات مهمة:

// المنفذ
const PORT = process.env.PORT || 3001;

// الـ CORS
app.use(cors({
  origin: 'http://localhost:5173',  // عميل وحيد في التطوير
  credentials: true
}));

// حد أقصى لحجم الطلب
app.use(express.json({ limit: '10mb' }));

// Timeout
server.timeout = 30000; // 30 ثانية

// عدد الاتصالات قصوى
pool = mysql.createPool({
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});
```

### الملف: `server/.env`

```env
# القيم المهمة:

PORT=3001                        # يجب أن يكون مختلف عن منفذ العميل
ENVIRONMENT=development          # development أو production
JWT_EXPIRE=7d                   # مدة صلاحية التوكن
```

---

## ⚛️ إعدادات العميل

### الملف: `client/my-react-app/vite.config.js`

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,           // منفذ خادم التطوير
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

### الملف: `client/my-react-app/.env` (اختياري)

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=مكتبتي
VITE_ENVIRONMENT=development
```

### محتوى `client/my-react-app/src/services/api.js`

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## 🎨 متغيرات CSS

### الألوان الأساسية

```css
:root {
  /* الألوان الأساسية */
  --primary-color: #2c5c34;          /* أخضر داكن */
  --primary-light: #3d7d42;          /* أخضر فاتح */
  --accent-color: #d4af37;           /* ذهبي */
  
  /* ألوان الخلفية */
  --background-color: #f5f7f3;       /* خلفية فاتحة */
  --card-background: #ffffff;        /* خلفية البطاقات */
  
  /* ألوان النصوص */
  --text-light: #ffffff;             /* نص أبيض */
  --text-dark: #333333;              /* نص داكن */
  --text-muted: #666666;             /* نص فاتح */
  
  /* ألوان الحالات */
  --success-color: #28a745;          /* أخضر النجاح */
  --error-color: #dc3545;            /* أحمر الخطأ */
  --warning-color: #ffc107;          /* أصفر التحذير */
  --info-color: #17a2b8;             /* أزرق المعلومات */
  
  /* المسافات */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* الظلال */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
  
  /* الانتقالات */
  --transition-fast: 0.15s ease-in-out;
  --transition-base: 0.3s ease-in-out;
  --transition-slow: 0.5s ease-in-out;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
}
```

### استخدام المتغيرات في CSS

```css
.button {
  background-color: var(--primary-color);
  color: var(--text-light);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  transition: background-color var(--transition-base);
  box-shadow: var(--shadow-md);
}

.button:hover {
  background-color: var(--primary-light);
  box-shadow: var(--shadow-lg);
}
```

---

## 📋 أمثلة الإعدادات

### 1. إعدادات التطوير المحلي

```env
# server/.env
PORT=3001
ENVIRONMENT=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=library_db
DB_PORT=3306

JWT_SECRET=my_secret_key_for_development_only
JWT_EXPIRE=7d
```

### 2. إعدادات الاختبار

```env
# server/.env.test
PORT=3002
ENVIRONMENT=test

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=test_password
DB_NAME=library_db_test
DB_PORT=3306

JWT_SECRET=test_secret_key_only_for_testing
JWT_EXPIRE=1h
```

### 3. إعدادات الإنتاج

```env
# server/.env.production
PORT=3001
ENVIRONMENT=production

DB_HOST=production-db.rds.amazonaws.com
DB_USER=prod_user
DB_PASSWORD=very_strong_password_here
DB_NAME=library_db_prod
DB_PORT=3306

JWT_SECRET=a_very_long_random_secret_key_at_least_32_chars_xK9mL$2pQ#vW7nJ&4aZbCdEfGhIjKlMn
JWT_EXPIRE=7d
```

---

## 🔍 التحقق من الإعدادات

### 1. تحقق من قاعدة البيانات

```bash
# الاتصال بـ MySQL
mysql -u root -p

# أو
mysql -h localhost -u root -p library_db

# تحقق من قائمة قواعد البيانات
SHOW DATABASES;

# تحقق من الجداول
USE library_db;
SHOW TABLES;

# تحقق من البيانات
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM books;
```

### 2. تحقق من متغيرات البيئة

```javascript
// في server/index.js أضف:
console.log('Current Environment:', process.env.ENVIRONMENT);
console.log('Database Host:', process.env.DB_HOST);
console.log('JWT Expire:', process.env.JWT_EXPIRE);
```

### 3. اختبر الاتصال بالخادم

```bash
# في Terminal:
curl http://localhost:3001/api/health

# نتيجة متوقعة:
{
  "status": "Server is running",
  "database": "Connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ⚠️ نصائح أمان مهمة

```env
# ❌ ما لا تفعله:
JWT_SECRET=12345              # سهل جداً
DB_PASSWORD=admin             # كلمة سر ضعيفة
PORT=3000                      # منفذ شهير

# ✅ ما يجب أن تفعله:
JWT_SECRET=xK9mL$2pQ#vW7nJ&4aZbCdEfGhIjKlMnOpQrStUvWxYz123456789!@#$%^&*()
DB_PASSWORD=P@ssw0rd!#$%^&*()2024
PORT=3001                      # منفذ فريد
```

---

## 📊 جدول سريع للإعدادات

| الإعداد | القيمة الافتراضية | الوصف | مثال |
|--------|------------------|--------|--------|
| PORT | 3001 | منفذ الخادم | `PORT=3001` |
| ENVIRONMENT | development | بيئة التشغيل | `ENVIRONMENT=production` |
| DB_HOST | localhost | مضيف قاعدة البيانات | `DB_HOST=localhost` |
| DB_USER | root | مستخدم قاعدة البيانات | `DB_USER=root` |
| DB_PASSWORD | (فارغ) | كلمة سر قاعدة البيانات | `DB_PASSWORD=secure123` |
| DB_NAME | library_db | اسم قاعدة البيانات | `DB_NAME=library_db` |
| JWT_SECRET | (مطلوب) | مفتاح التوقيع | `JWT_SECRET=your_secret...` |
| JWT_EXPIRE | 7d | صلاحية التوكن | `JWT_EXPIRE=7d` |

---

## 🆘 استكشاف الأخطاء

### خطأ: "Cannot connect to database"

```env
# تحقق من:
✅ DB_HOST صحيح (localhost للتطوير المحلي)
✅ DB_USER موجود
✅ DB_PASSWORD صحيحة
✅ DB_NAME موجود
✅ MySQL يعمل
```

### خطأ: "Invalid token"

```env
# تحقق من:
✅ JWT_SECRET نفس القيمة في كل مكان
✅ التوكن لم يُحذف أو تم تعديله
✅ JWT_EXPIRE لم ينتهي بعد
```

### خطأ: "Cannot access on client"

```env
# تحقق من:
✅ المنفذ 5173 مفتوح
✅ الخادم يعمل على المنفذ 3001
✅ CORS مفعل في الخادم
✅ العميل يرسل token صحيح
```

---

**آخر تحديث:** 2024
**الإصدار:** 1.0
