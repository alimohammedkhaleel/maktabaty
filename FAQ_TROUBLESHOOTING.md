# ❓ الأسئلة الشائعة والمشاكل الشائعة (FAQ & Troubleshooting)

## 📚 جدول المحتويات

1. [أسئلة شائعة عامة](#أسئلة-شائعة-عامة)
2. [مشاكل التثبيت والإعداد](#مشاكل-التثبيت-والإعداد)
3. [مشاكل الخادم](#مشاكل-الخادم)
4. [مشاكل قاعدة البيانات](#مشاكل-قاعدة-البيانات)
5. [مشاكل الواجهة الأمامية](#مشاكل-الواجهة-الأمامية)
6. [مشاكل المصادقة والأمان](#مشاكل-المصادقة-والأمان)

---

## ❓ أسئلة شائعة عامة

### س: كيف أبدأ المشروع؟
**ج:** اتبع هذه الخطوات:

```bash
# 1. فتح Terminal في مجلد الخادم
cd server
npm install

# 2. تشغيل الخادم
npm run dev

# 3. فتح Terminal جديد في مجلد العميل
cd client/my-react-app
npm install

# 4. تشغيل العميل
npm run dev

# 5. افتح المتصفح:
http://localhost:5173
```

### س: ما هو رقم المنفذ للخادم والعميل؟
**ج:** 
- الخادم: `http://localhost:3001`
- العميل: `http://localhost:5173`

### س: كيف أنشئ حساب مسؤول (Admin)?
**ج:** عند التسجيل، جميع الحسابات الجديدة تكون مستخدمين عاديين. لإنشاء مسؤول:

```sql
-- في MySQL:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### س: هل يمكن استخدام قاعدة بيانات مختلفة؟
**ج:** نعم، عدّل ملف `server/.env`:

```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

### س: كيف أغيّر لون الموضوع (Theme)?
**ج:** عدّل متغيرات الألوان في ملفات CSS:

```css
/* في كل ملف CSS */
:root {
  --primary-color: #2c5c34;      /* الأخضر الأساسي */
  --primary-light: #3d7d42;      /* أخضر فاتح */
  --accent-color: #d4af37;       /* ذهبي */
  --background-color: #f5f7f3;   /* لون الخلفية */
  --text-light: #ffffff;         /* نص أبيض */
  --text-dark: #333333;          /* نص داكن */
}
```

### س: كيف أضيف كتباً جديدة؟
**ج:** تسجيل دخول كمسؤول → اضغط على `Admin` → استخدم نموذج `Add Book`

---

## 🔧 مشاكل التثبيت والإعداد

### ❌ مشكلة: `npm: command not found`

**السبب:** Node.js و npm غير مثبتة

**الحل:**
```bash
# قم بتحميل وتثبيت Node.js من:
# https://nodejs.org/ (اختر LTS)

# تحقق من التثبيت:
node --version
npm --version
```

### ❌ مشكلة: `Cannot find module 'express'`

**السبب:** المكتبات لم يتم تثبيتها

**الحل:**
```bash
# في مجلد server:
npm install

# تأكد من وجود package.json
# وقم بتثبيت المكتبات يدويا إذا لزم الأمر:
npm install express cors dotenv mysql2 bcryptjs jsonwebtoken multer axios
```

### ❌ مشكلة: `Error: ENOENT: no such file or directory`

**السبب:** ملف .env غير موجود

**الحل:**
```bash
# في مجلد server، أنشئ ملف .env:
# انسخ محتوى .env.example إلى .env

copy .env.example .env    # على Windows

# أو عدّل المتغيرات يدويا
```

### ❌ مشكلة: `port 3001 already in use`

**السبب:** يوجد عملية أخرى تستخدم نفس المنفذ

**الحل على Windows:**
```powershell
# ابحث عن العملية:
netstat -ano | findstr :3001

# اقتل العملية (استبدل PID بالرقم):
taskkill /PID <PID> /F

# أو غيّر المنفذ في .env:
PORT=3002
```

**الحل على Linux/Mac:**
```bash
# ابحث عن العملية:
lsof -i :3001

# اقتل العملية:
kill -9 <PID>
```

---

## 🖥️ مشاكل الخادم

### ❌ مشكلة: `Cannot connect to database`

**السبب:** إعدادات قاعدة البيانات خاطئة

**الحل:**
```bash
# تحقق من ملف .env:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=library_db

# تأكد من تشغيل MySQL:
# علي Windows: ابحث عن MySQL في Services
# على Linux: sudo service mysql status
```

### ❌ مشكلة: `Server started but no database connection`

**السبب:** قاعدة البيانات قد لم تُنشأ تلقائياً

**الحل:**
```bash
# أعد تشغيل الخادم عدة مرات
npm run dev

# أو أنشئ قاعدة البيانات يدويا:
mysql -u root -p
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# ثم أعد تشغيل الخادم
npm run dev
```

### ❌ مشكلة: `CORS error when accessing from client`

**السبب:** إعدادات CORS خاطئة

**الحل:**
```javascript
// في server/index.js، تحقق من:
app.use(cors({
  origin: 'http://localhost:5173',  // تأكد من الـ URL الصحيح
  credentials: true
}));
```

### ❌ مشكلة: `API returning 500 error`

**السبب:** خطأ في الكود أو قاعدة البيانات

**الحل:**
```bash
# تحقق من Terminal (حيث يعمل الخادم)
# ستجد رسالة الخطأ الحقيقية هناك

# أو أضف logging:
console.log('Error:', error);
logger.error('Endpoint error', error);
```

---

## 🗄️ مشاكل قاعدة البيانات

### ❌ مشكلة: `MySQL service not running`

**الحل على Windows:**
```powershell
# افتح Services:
# Right-click على "This PC" → Manage → Services
# ابحث عن MySQL
# اضغط Start

# أو من PowerShell:
Start-Service MySQL80  # تأكد من رقم الإصدار
```

**الحل على Linux:**
```bash
sudo service mysql start
# أو
sudo /usr/local/mysql/support-files/mysql.server start
```

### ❌ مشكلة: `Access denied for user 'root'`

**السبب:** كلمة السر خاطئة

**الحل:**
```bash
# عدّل كلمة السر في .env:
DB_PASSWORD=your_actual_password

# أو أعد تعيين كلمة السر في MySQL:
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

### ❌ مشكلة: `Table doesn't exist`

**السبب:** الجداول لم تُنشأ

**الحل:**
```bash
# أعد تشغيل الخادم (ستُنشأ تلقائياً):
npm run dev

# أو أنشئها يدويا - انسخ والصق محتوى initDB.js في MySQL
mysql -u root -p library_db < init.sql
```

### ❌ مشكلة: `Duplicate entry error`

**السبب:** محاولة إدراج بيانات مكررة

**الحل:**
```sql
-- تحقق من البيانات الموجودة:
SELECT * FROM users WHERE email = 'your-email@example.com';

-- احذف البيانات المكررة إذا لزم:
DELETE FROM users WHERE email = 'duplicate@example.com';
```

---

## 🎨 مشاكل الواجهة الأمامية

### ❌ مشكلة: `blank page` عند فتح التطبيق

**السبب:** 
- الخادم لم يبدأ
- عنوان الـ API خاطئ
- خطأ في JavaScript

**الحل:**
```bash
# تأكد من تشغيل الخادم:
# في Terminal الخادم، يجب أن ترى: "Server running..."

# اضغط F12 لفتح DevTools
# ابحث عن رسائل الأخطاء في Console

# تحقق من الـ Network tab:
# هل الطلبات تصل إلى الخادم؟
```

### ❌ مشكلة: `animations are laggy or stuttering`

**السبب:** الجهاز ضعيف أو المتصفح بطيء

**الحل:**
```javascript
// عدّل سرعة الحركات في الكود:
// بدلا من: duration: 0.6
// استخدم: duration: 0.3 (أسرع)

// أو عطّل الحركات في الإعدادات
```

### ❌ مشكلة: `buttons not responding`

**السبب:** JavaScript غير محمل بشكل صحيح

**الحل:**
```bash
# تأكد من تثبيت المكتبات:
npm install

# امسح cache المتصفح:
# Ctrl+Shift+Delete (في معظم المتصفحات)

# أعد تحميل الصفحة:
F5 أو Ctrl+R
```

### ❌ مشكلة: `CSS styles not applied`

**السبب:** الملفات لم تُحمّل

**الحل:**
```bash
# تأكد من وجود ملفات CSS:
# src/components/*/component.css

# أعد تشغيل خادم التطوير:
Ctrl+C
npm run dev

# امسح cache المتصفح واعد التحميل
```

### ❌ مشكلة: `images not showing`

**السبب:** مسار الصور خاطئ

**الحل:**
```javascript
// استخدم المسارات النسبية الصحيحة:
// ❌ wrong: import logo from 'logo.png'
// ✅ correct: import logo from '../assets/logo.png'

// لـ public folder:
// ✅ <img src="/images/logo.png" />
```

---

## 🔐 مشاكل المصادقة والأمان

### ❌ مشكلة: `login not working`

**السبب:** 
- بيانات المستخدم خاطئة
- قاعدة البيانات فارغة
- مشكلة في الخادم

**الحل:**
```bash
# تحقق من وجود المستخدم:
mysql -u root -p
USE library_db;
SELECT * FROM users;

# أضف مستخدم اختبار:
INSERT INTO users (username, email, password_hash, role) 
VALUES ('testuser', 'test@example.com', '$2a$10$...', 'user');
```

### ❌ مشكلة: `token expired`

**السبب:** انقضت مدة صلاحية التوكن (7 أيام)

**الحل:**
```bash
# قم بتسجيل الدخول مرة أخرى
# سيتم إصدار توكن جديد

# أو غيّر مدة انتهاء الصلاحية في .env:
JWT_EXPIRE=30d  # بدلا من 7d
```

### ❌ مشكلة: `permission denied on admin panel`

**السبب:** أنت لست مسؤولا

**الحل:**
```sql
-- غيّر الدور إلى admin:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- تحقق من التغيير:
SELECT email, role FROM users;
```

### ❌ مشكلة: `logout not working`

**السبب:** مشكلة مع حذف البيانات المخزنة

**الحل:**
```javascript
// افتح DevTools Console:
// امسح localStorage يدويا:
localStorage.clear();

// أو على صفحة معينة:
localStorage.removeItem('auth_token');
localStorage.removeItem('user_data');
```

---

## 🆘 ماذا تفعل عند مواجهة مشكلة غير موجودة هنا؟

1. **اقرأ رسالة الخطأ بانتباه** - تحتوي على معلومات مهمة
2. **ابحث عن الخطأ على Google** - غالباً ما تجد الحل
3. **افتح DevTools** (F12) وتحقق من الأخطاء
4. **تحقق من ملفات السجل** (logs):
   - Server console (Terminal)
   - Browser console (DevTools)
   - Browser network (DevTools → Network)
5. **جرّب إعادة التشغيل**:
   - أغلق الخادم وأعد تشغيله
   - أغلق المتصفح وأعد فتحه
   - أعد تشغيل النظام إذا لزم الأمر

---

## 📞 معلومات مفيدة

### رسائل الخطأ الشائعة وترجمتها:

| الرسالة | المعنى | الحل |
|--------|--------|------|
| `ECONNREFUSED` | الخادم معطل | أعد تشغيل الخادم |
| `UNKNOWN_TABLE` | الجدول غير موجود | أنشئ قاعدة البيانات |
| `Access denied` | كلمة سر خاطئة | تحقق من .env |
| `404 Not Found` | الـ endpoint غير موجود | تحقق من الـ URL |
| `CORS error` | مشكلة في CORS | تحقق من server/index.js |
| `Cannot find module` | المكتبة غير مثبتة | npm install |

---

## ✅ نصائح للنجاح

1. **دائماً اقرأ الأخطاء** - تحتوي على المعلومة الأهم
2. **استخدم Terminal بدلا من PowerShell** - أقل مشاكل
3. **لا تفتح عدة مرات للمشروع** - قد تسبب تضارب
4. **حافظ على .env في مكان آمن** - لا تشارك كلماتك
5. **احفظ التغييرات قبل الاختبار** - تأكد من Save (Ctrl+S)
6. **اختبر في متصفح مختلف** - قد تكون مشكلة متصفح

---

**هل لديك مشكلة أخرى؟** راجع الملفات الأخرى:
- [STARTUP_GUIDE.md](STARTUP_GUIDE.md) - دليل البدء
- [README.md](README.md) - الوثائق الرئيسية
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - دليل النشر
