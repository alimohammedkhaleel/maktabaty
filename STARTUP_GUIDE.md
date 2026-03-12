# 🚀 دليل البدء السريع - مكتبة الأخلاق الرقمية

## ✅ المتطلبات المسبقة

الرجاء التأكد من:
- [ ] تثبيت Node.js (v14+)
- [ ] تثبيت MySQL (v5.7+)
- [ ] استخدام Windows PowerShell أو Terminal آخر
- [ ] الوصول إلى منفذ 3001 و 5173

---

## 📋 الخطوات الأولى

### الخطوة 1: التنقل إلى مجلد المشروع

```powershell
cd "e:\revesion of html , css , java script\مكتبتي"
```

### الخطوة 2: إعداد قاعدة البيانات

#### الطريقة الأولى: التشغيل التلقائي 🔄
عند تشغيل الخادم أول مرة، سيقوم تلقائياً بـ:
- إنشاء قاعدة البيانات
- إنشاء جميع الجداول
- إضافة البيانات الأولية

#### الطريقة الثانية: اليدويات 🛠️
```sql
-- افتح MySQL Workbench أو phpMyAdmin وقم بتشغيل:
CREATE DATABASE IF NOT EXISTS library_db 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE library_db;
-- سيتم إنشاء الجداول تلقائياً
```

### الخطوة 3: حفظ متغيرات البيئة

```bash
# في مجلد server، تأكد من وجود ملف .env
# مع هذه البيانات:

PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=         # اتركها فارغة أو ضع كلمة المرور
DB_NAME=library_db
DB_PORT=3306
JWT_SECRET=my_super_secret_key_12345
JWT_EXPIRE=7d
ENVIRONMENT=development
```

---

## 🖥️ تشغيل التطبيق

### طريقة 1: استخدام Terminal منفصلة (موصى بهـا) ✅

#### Terminal 1 - الخادم:
```powershell
cd server
npm install  # (أول مرة فقط)
npm run dev
```

#### Terminal 2 - العميل:
```powershell
cd client/my-react-app
npm install  # (أول مرة فقط)
npm run dev
```

#### Terminal 3 - اختياري - مراقبة MySQL:
```powershell
# تأكد من تشغيل MySQL Service
Get-Service "MySQL80" | Start-Service  # أو الإصدار الخاص بك
```

### طريقة 2: استخدام VS Code Terminal

```powershell
# فتح المجلد في VS Code
code .

# ثم استخدم Ctrl+` لفتح Terminal
# ستجد محطات متعددة

# في المحطة الأولى - الخادم:
cd server && npm run dev

# في المحطة الثانية - العميل:
cd client\my-react-app && npm run dev
```

---

## 🌐 الوصول إلى التطبيق

بعد التشغيل الناجح، ستجد:

```
🔹 الخادم:    http://localhost:3001
   🏥 Health Check: http://localhost:3001/api/health

🔹 العميل:    http://localhost:5173
   📱 الواجهة الرئيسية

🔹 قاعدة البيانات:  localhost:3306
   📊 استخدم MySQL Workbench أو phpMyAdmin
```

---

## 📝 عملية التسجيل والدخول

### التسجيل 📩
1. قم بفتح التطبيق
2. انقر على "إنشاء حساب"
3. ملء البيانات:
   - اسم المستخدم: `user123`
   - البريد الإلكتروني: `user@example.com`
   - كلمة المرور: `password123`
   - تأكيد كلمة المرور: `password123`
4. انقر على "إنشاء حساب"

### الدخول 🔐
1. استخدم البريد الإلكتروني وكلمة المرور
2. انقر على "دخول"

### بيانات تجريبية:
```
البريد الإلكتروني: admin@example.com
كلمة المرور: admin123
دور المستخدم: Admin (لديه صلاحيات إضافية)
```

---

## 🎯 الميزات الرئيسية

### للمستخدم العادي:
- 📚 البحث والعثور على الكتب
- ⭐ إضافة الكتب للمفضلة
- 🤖 طرح الأسئلة على نموذج AI
- 💬 الحصول على إجابات ذكية

### للمسؤول:
- ➕ إضافة كتب جديدة
- ✏️ تعديل بيانات الكتب
- 🗑️ حذف الكتب
- 📊 عرض إحصائيات الكتب

---

## 🐛 استكشاف المشاكل الشائعة

### ❌ الخادم لا يعمل

```powershell
# التحقق من وجود المكتبات
npm list

# حل المشكلة:
npm install --legacy-peer-deps

# إعادة التشغيل
npm run dev
```

### ❌ خطأ في قاعدة البيانات

```powershell
# تأكد من تشغيل MySQL
Get-Service | grep MySQL

# أو:
mysql -u root

# تحقق من .env
cat .env
```

### ❌ خطأ CORS

```javascript
// تأكد من أن الـ URL صحيح في:
// client/src/services/api.js

const API_BASE_URL = 'http://localhost:3001/api';
```

### ❌ البوابة (Port) مشغولة

```powershell
# البحث عن العملية التي تستخدم البوابة
netstat -ano | findstr :3001

# إيقاف العملية:
taskkill /PID <PID> /F

# أو غير البوابة في .env
PORT=3002
```

---

## 📦 الأوامر المفيدة

### للخادم:
```bash
npm install          # تثبيت المكتبات
npm run dev          # تشغيل مع nodemon
npm start            # تشغيل عادي
npm test             # تشغيل الاختبارات
```

### للعميل:
```bash
npm install          # تثبيت المكتبات
npm run dev          # تشغيل بـ Vite
npm run build        # بناء الإنتاج
npm run preview      # معاينة الإنتاج
npm run lint         # فحص الأخطاء
```

---

## 🔒 نصائح الأمان

### في التطوير (Development):
- ✅ استخدم كلمة سر بسيطة
- ✅ قم بتنشيط CORS للـ localhost فقط
- ✅ احفظ .env في .gitignore

### في الإنتاج (Production):
- ⚠️ غير JWT_SECRET إلى قيمة قوية
- ⚠️ استخدم HTTPS بدلاً من HTTP
- ⚠️ استخدم متغيرات بيئة آمنة
- ⚠️ قم بتحديث المكتبات بانتظام

---

## 📱 اختبار على أجهزة مختلفة

### على نفس الجهاز:
```
http://localhost:5173
```

### على جهاز آخر في الشبكة:
```
http://<your-ip>:5173
http://192.168.x.x:5173
```

### على الهاتف:
1. تأكد من اتصال الهاتف بنفس الشبكة
2. ابحث عن IP الكمبيوتر: `ipconfig`
3. في الهاتف: `http://<computer-ip>:5173`

---

## 🧪 اختبار الـ API

### استخدام Postman أو Thunder Client:

#### تسجيل مستخدم جديد:
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123456",
  "confirmPassword": "test123456"
}
```

#### الدخول:
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123456"
}
```

#### الحصول على الكتب:
```
GET http://localhost:3001/api/books
```

#### طرح سؤال على AI:
```
POST http://localhost:3001/api/ai/ask
Content-Type: application/json
Authorization: Bearer <token>

{
  "question": "من هو مؤلف هذا الكتاب؟",
  "book_id": 1
}
```

---

## 📊 مراقبة الأداء

### استخدام DevTools:
- اضغط F12 في المتصفح
- قسم Network لمراقبة الطلبات
- قسم Console لعرض الأخطاء

### استخدام MySQL:
```sql
-- عدد المستخدمين
SELECT COUNT(*) FROM users;

-- عدد الكتب
SELECT COUNT(*) FROM books;

-- آخر الأسئلة
SELECT * FROM qa_history ORDER BY created_at DESC LIMIT 10;
```

---

## 🎉 مبروك!

الآن أنت جاهز لـ:
- ✅ استكشاف المكتبة
- ✅ إضافة الكتب
- ✅ طرح الأسئلة على الـ AI
- ✅ إدارة المحتوى (إذا كنت Admin)

---

## 📞 الدعم والمساعدة

إذا واجهت مشاكل:

1. **تحقق من .env** ✅
2. **أعد تشغيل الخادم** 🔄
3. **امسح ذاكرة التخزين المؤقتة** 🧹
4. **راجع قسم الأخطاء أعلاه** 🔍

---

**استمتع بـ مكتبة الأخلاق الرقمية! 📚✨**
