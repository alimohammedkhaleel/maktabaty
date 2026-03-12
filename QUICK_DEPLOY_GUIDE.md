# 🚀 دليل النشر السريع - مشروع مكتبتي

## ⚠️ مهم: المشروع لم يُرفع بعد!

تم تجهيز الملفات فقط. يجب عليك اتباع الخطوات التالية:

---

## 📌 الخطوات المطلوبة

### الخطوة 1: رفع على GitHub (إلزامي)

```bash
# في Terminal، نفذ الأوامر التالية:

# 1. تهيئة Git
git init

# 2. إضافة الملفات
git add .

# 3. إنشاء Commit
git commit -m "Initial commit - Maktabaty Project"

# 4. إنشاء Repository على GitHub
# اذهب إلى: https://github.com/new
# اسم الـ Repository: maktabaty
# اجعله Public
# انقر Create repository

# 5. ربط المشروع (استبدل YOUR_USERNAME باسمك)
git remote add origin https://github.com/YOUR_USERNAME/maktabaty.git

# 6. رفع الكود
git branch -M main
git push -u origin main
```

---

### الخطوة 2: قاعدة البيانات (Railway - مجاني)

**الخيار 1: Railway (موصى به)**

1. اذهب إلى: https://railway.app
2. سجل دخول بـ GitHub
3. انقر **New Project**
4. اختر **Provision MySQL**
5. بعد الإنشاء، اذهب إلى تبويب **Variables**
6. احفظ بيانات الاتصال:
   - `MYSQL_HOST` (Host)
   - `MYSQL_USER` (User)
   - `MYSQL_PASSWORD` (Password)
   - `MYSQL_DATABASE` (Database Name)
   - `MYSQL_PORT` (Port - عادة 3306)

**الخيار 2: Aiven (بديل)**

1. اذهب إلى: https://aiven.io
2. سجل دخول بـ GitHub
3. Create Service > MySQL
4. اختر الخطة المجانية (Free tier)
5. احفظ بيانات الاتصال من صفحة Overview

---

### الخطوة 3: الباك إند (Render)

1. اذهب إلى: https://render.com
2. سجل دخول بـ GitHub
3. New > Web Service
4. اختر repository: `maktabaty`
5. الإعدادات:
   ```
   Name: maktabaty-backend
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```
6. أضف Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=[من Railway/Aiven]
   DB_USER=[من Railway/Aiven]
   DB_PASSWORD=[من Railway/Aiven]
   DB_NAME=[من Railway/Aiven]
   DB_PORT=3306
   JWT_SECRET=[نص عشوائي طويل]
   JWT_EXPIRE=7d
   GEMINI_API_KEY=AIzaSyAskyJ3CPSQJbdH112TLXaS36Z4HakArJg
   ENVIRONMENT=production
   ```
7. انقر Create Web Service
8. **احفظ الرابط** مثل: `https://maktabaty-backend.onrender.com`

---

### الخطوة 4: الفرونت إند (Vercel)

1. اذهب إلى: https://vercel.com
2. سجل دخول بـ GitHub
3. Add New > Project
4. اختر repository: `maktabaty`
5. الإعدادات:
   ```
   Project Name: maktabaty
   Framework: Vite
   Root Directory: client/my-react-app
   Build Command: npm run build
   Output Directory: dist
   ```
6. أضف Environment Variable:
   ```
   VITE_API_URL=https://maktabaty-backend.onrender.com/api
   ```
   (استخدم رابط Render من الخطوة 3)
7. انقر Deploy
8. **احفظ الرابط** مثل: `https://maktabaty.vercel.app`

---

### الخطوة 5: تحديث CORS

1. ارجع إلى Render
2. اذهب إلى Environment Variables
3. أضف:
   ```
   FRONTEND_URL=https://maktabaty.vercel.app
   ```
   (استخدم رابط Vercel من الخطوة 4)
4. احفظ (سيعيد Deploy تلقائياً)

---

## ✅ بعد الانتهاء

ستحصل على:
- **الموقع:** `https://maktabaty.vercel.app`
- **API:** `https://maktabaty-backend.onrender.com`
- **GitHub:** `https://github.com/YOUR_USERNAME/maktabaty`

---

## 🎯 ملاحظات مهمة

1. **اسم المشروع في الرابط:** سيكون `maktabaty` في جميع الروابط
2. **الخطة المجانية:** السيرفر قد ينام بعد 15 دقيقة من عدم الاستخدام
3. **أول طلب:** قد يأخذ 30-60 ثانية بعد النوم
4. **حساب Admin:** بعد النشر، استخدم Render Shell لإنشاء admin:
   ```bash
   cd server
   node scripts/createAdmin.js
   ```

---

## 🆘 مشاكل شائعة

### لا يمكن رفع على GitHub
```bash
# تأكد من تسجيل الدخول
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### CORS Error
- تأكد من إضافة `FRONTEND_URL` في Render
- تأكد من تطابق الروابط

### Database Error
- تحقق من بيانات قاعدة البيانات
- تأكد من أن DB نشطة في Clever Cloud

---

## 📞 هل تحتاج مساعدة؟

إذا واجهت مشكلة في أي خطوة، أخبرني وسأساعدك! 😊
