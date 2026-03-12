# نظام الاختبارات - دليل الاستخدام الكامل

## 📋 ملخص النظام

يحتوي النظام على:
- **AI**: يقرأ ملف PDF ويولد أسئلة اختبار تلقائياً (6 أسئلة × 4 خيارات لكل سؤال)
- **Admin Panel**: مشرف يرفع PDF ويراجع الأسئلة المولدة ويشرها
- **Student Quiz Interface**: الطالب يختار من 4 خيارات لكل سؤال
- **Auto-Scoring**: النظام يصحح الأجوبة تلقائياً ويعطي النقاط
- **Leaderboard**: ترتيب الطلاب حسب النقاط

---

## 🚀 خطوات الإعداد

### 1. متطلبات النظام
- Node.js v20+
- MySQL/MariaDB
- OpenAI API Key (اختياري - لتوليد أسئلة ذكية)

### 2. إعداد قاعدة البيانات
تم إنشاء الجداول بنجاح:
```bash
cd server
node scripts/createQuizTables.js
```

الجداول التالية:
- `quizzes`: الاختبارات (id, book_id, title, created_by, published)
- `quiz_questions`: الأسئلة (id, quiz_id, question, options_json, answer_index)
- `quiz_results`: النتائج (id, quiz_id, user_id, score, created_at)

### 3. إعداد OpenAI (اختياري لكن موصى به)
أضف إلى `.env`:
```
OPENAI_API_KEY=sk-proj-xxxxx
```

بدون المفتاح، سيستخدم النظام أسئلة افتراضية بسيطة.

---

## 📝 سير العمل الكامل

### المرحلة 1: المشرف يرفع كتاب بـ PDF
1. ادخل Admin Dashboard (`/admin`)
2. اضغط "إضافة كتاب جديد"
3. ملء البيانات:
   - العنوان والمؤلف والفئة إلخ
   - **اختياري**: رفع ملف PDF
4. اضغط "إضافة"

### المرحلة 2: المشرف يولد الأسئلة
1. في بطاقة الكتاب، اضغط "توليد كويز"
2. النظام يقرأ PDF ويولد 6 أسئلة × 4 خيارات
3. يفتح modal يعرض الأسئلة للمراجعة
4. اضغط "نشر الكويز" لجعله متاح للطلاب

### المرحلة 3: الطالب يأخذ الاختبار
1. ادخل قسم "الاختبارات" من الـ Navbar
2. اختر اختبار من القائمة
3. اقرأ كل سؤال واختر إجابة من 4 خيارات
4. بعد الإجابة على جميع الأسئلة، اضغط "إنهاء الاختبار"

### المرحلة 4: النظام يصحح ويظهر النتيجة
1. النظام يقارن إجاباتك بالإجابات الصحيحة
2. يظهر:
   - عدد الأسئلة الصحيحة ÷ الإجمالي
   - النسبة المئوية
3. يمكنك عرض الترتيب (Leaderboard)

---

## 🔧 تفاصيل العمل التقني

### توليد الأسئلة (OpenAI)
```javascript
// الـ Prompt المرسل للـ AI:
"Generate exactly 6 multiple-choice questions from this text. 
Each question MUST have exactly 4 options.
Respond ONLY with valid JSON array, no markdown.
Format: [{"question":"...", "options":["A","B","C","D"], "answerIndex":0}]"
```

### التصحيح التلقائي
```javascript
// عندما ترسل الإجابات:
{
  answers: [
    { question_id: 1, answerIndex: 2 },  // اخترت الخيار الثالث (C)
    { question_id: 2, answerIndex: 0 },  // اخترت الخيار الأول (A)
    ...
  ]
}

// النظام يقارن:
- كل answer_index مع الإجابة الصحيحة المحفوظة
- يحسب عدد الصحيح = عدد التطابقات
- يحفظ النتيجة في جدول quiz_results
```

---

## 📊 قاعدة البيانات

### جدول quizzes
```sql
CREATE TABLE quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT,
  title VARCHAR(255),
  created_by INT,
  published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### جدول quiz_questions
```sql
CREATE TABLE quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT,
  question TEXT,
  options_json TEXT,  -- ["Option A", "Option B", "Option C", "Option D"]
  answer_index INT,   -- 0, 1, 2, or 3
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
```

### جدول quiz_results
```sql
CREATE TABLE quiz_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT,
  user_id INT,
  score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🎯 API Endpoints

### للمشرف (Admin)
```
POST /api/quizzes

- **الوصف**: إنشاء اختبار جديد فارغ مرتبط بكتاب. يتطلب `book_id` في الجسم.
- **الجسم**: `{ "book_id": <id> }`
- **استجابة**: `{ success: true, quizId: <id> }`

POST /api/quizzes/generate/:book_id
- يولد اختبار من ملف PDF الكتاب
- يرجع: {quizId, questions[], ...}

POST /api/quizzes/publish/:quiz_id
- ينشر الاختبار ليكون متاح للطلاب
```

### للطلاب (Students)
```
GET /api/quizzes
- قائمة الاختبارات المنشورة

GET /api/quizzes/:quiz_id
- تفاصيل اختبار (الأسئلة والخيارات فقط، بدون إجابات)

POST /api/quizzes/submit/:quiz_id
- إرسال الإجابات وتصحيحها تلقائياً

GET /api/quizzes/leaderboard/:quiz_id
- ترتيب الطلاب حسب النقاط
```

---

## ✅ قائمة التحقق قبل الاستخدام

- [x] قواعد البيانات: تم إنشاء الجداول
- [x] Backend Routes: تم إضافة جميع الـ routes
- [x] Frontend Components: QuizList, QuizPage, Leaderboard
- [x] Admin UI: زر "توليد كويز" و modal المراجعة
- [x] Navbar: تم إضافة رابط الاختبارات
- [x] AI Prompt: تم تحسينه للحصول على 4 خيارات تماماً
- [x] Validation: التحقق من إجابة جميع الأسئلة

---

## 🧪 اختبار النظام

### خطوات الاختبار اليدوي:

1. **ادخل كـ Admin**
   ```
   Email: admin@library.com
   Password: admin123
   ```

2. **أضف كتاب بـ PDF**
   - اذهب /admin
   - اضغط "إضافة كتاب جديد"
   - ارفع أي ملف PDF
   - اضغط "إضافة"

3. **ولد اختبار**
   - من بطاقة الكتاب، اضغط "توليد كويز"
   - سيظهر modal بـ 6 أسئلة × 4 خيارات
   - اضغط "نشر الكويز"

4. **ادخل كـ Student وخذ الاختبار**
   - اخرج من Admin Dashboard
   - ادخل على الاختبارات
   - اختر الاختبار واملأ الأجوبة
   - شوف النتيجة والترتيب

---

## 🐛 استكشاف الأخطاء

### "OpenAI API Error"
- تحقق من `OPENAI_API_KEY` في `.env`
- النظام سيستخدم أسئلة بسيطة كـ fallback

### "PDF not found"
- تأكد أن الملف تم رفعه بنجاح
- تحقق من مجلد `/server/uploads`

### الأسئلة بدون 4 خيارات
- تحسين الـ Prompt تم تطبيقه
- إذا حصل، النظام يصفي الأسئلة السيئة

---

## 📱 URLs للوصول

- **Admin Panel**: http://localhost:5173/admin
- **Quiz List**: http://localhost:5173/quizzes
- **Specific Quiz**: http://localhost:5173/quizzes/:id
- **Leaderboard**: http://localhost:5173/quizzes/:id/leaderboard

---

جاهز! النظام كامل وجاهز للاستخدام 🎉
