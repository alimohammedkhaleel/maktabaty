/**
 * 🧪 اختبارات API يدوية (Manual API Testing)
 * 
 * كيفية الاستخدام:
 * 1. تأكد من تشغيل الخادم (npm run dev في مجلد server)
 * 2. افتح هذا الملف في Postman أو استخدم curl
 * 3. أو نسخ الطلبات وشغلها في Terminal
 * 
 * الملف يحتوي على أمثلة كاملة لجميع endpoints
 */

// ========================
// 1️⃣ المصادقة (Authentication)
// ========================

/**
 * 📝 تسجيل مستخدم جديد
 * POST http://localhost:3001/api/auth/register
 * Content-Type: application/json
 */
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securePassword123!"
}

// استجابة متوقعة:
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}

// ========================

/**
 * 🔑 تسجيل دخول
 * POST http://localhost:3001/api/auth/login
 * Content-Type: application/json
 */
{
  "email": "test@example.com",
  "password": "securePassword123!"
}

// استجابة متوقعة:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}

// ========================

/**
 * 👤 الحصول على بيانات المستخدم
 * GET http://localhost:3001/api/auth/profile
 * Authorization: Bearer <token>
 */

// استجابة متوقعة:
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "avatar_url": null,
  "role": "user",
  "created_at": "2024-01-15T10:30:00.000Z"
}

// ========================

/**
 * ✏️ تحديث بيانات المستخدم
 * PUT http://localhost:3001/api/auth/profile
 * Authorization: Bearer <token>
 * Content-Type: application/json
 */
{
  "username": "newtestuser",
  "avatar_url": "https://example.com/avatar.png"
}

// استجابة متوقعة:
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "newtestuser",
    "email": "test@example.com",
    "avatar_url": "https://example.com/avatar.png"
  }
}

// ========================
// 2️⃣ إدارة الكتب (Books Management)
// ========================

/**
 * 📚 الحصول على جميع الكتب
 * GET http://localhost:3001/api/books
 * (بدون حاجة لـ Authorization)
 */

// استجابة متوقعة:
[
  {
    "id": 1,
    "title": "Sample Book",
    "author": "John Doe",
    "description": "A great book",
    "category": "Fiction",
    "published_year": 2024,
    "pages": 256,
    "cover_url": "https://...",
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "username": "testuser"
  }
]

// ========================

/**
 * 🔍 البحث عن كتب
 * GET http://localhost:3001/api/books/search?q=harry
 * (بدون حاجة لـ Authorization)
 */

// استجابة متوقعة:
[
  {
    "id": 2,
    "title": "Harry Potter",
    "author": "J.K. Rowling",
    "description": "A magical series",
    ...
  }
]

// ========================

/**
 * 📖 الحصول على كتاب واحد
 * GET http://localhost:3001/api/books/:id
 * (بدون حاجة لـ Authorization)
 */

// مثال:
GET http://localhost:3001/api/books/1

// استجابة متوقعة:
{
  "id": 1,
  "title": "Sample Book",
  "author": "John Doe",
  "description": "A great book",
  "category": "Fiction",
  "published_year": 2024,
  "pages": 256,
  "cover_url": "https://...",
  "created_by": 1,
  "created_at": "2024-01-15T10:30:00.000Z"
}

// ========================

/**
 * ➕ إضافة كتاب جديد (Admin Only)
 * POST http://localhost:3001/api/books
 * Authorization: Bearer <admin_token>
 * Content-Type: application/json
 */
{
  "title": "New Book",
  "author": "J.K. Rowling",
  "description": "An amazing book about magic",
  "category": "Fantasy",
  "published_year": 2024,
  "pages": 350,
  "cover_url": "https://example.com/cover.jpg",
  "file_url": "https://example.com/book.pdf"
}

// استجابة متوقعة:
{
  "message": "Book added successfully",
  "book": {
    "id": 2,
    "title": "New Book",
    "author": "J.K. Rowling",
    "description": "An amazing book about magic",
    "category": "Fantasy",
    "published_year": 2024,
    "pages": 350,
    "cover_url": "https://example.com/cover.jpg",
    "file_url": "https://example.com/book.pdf",
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}

// ========================

/**
 * 📝 تحديث كتاب
 * PUT http://localhost:3001/api/books/:id
 * Authorization: Bearer <token>
 * Content-Type: application/json
 */

// مثال:
PUT http://localhost:3001/api/books/1

{
  "title": "Updated Book Title",
  "description": "Updated description",
  "pages": 400
}

// استجابة متوقعة:
{
  "message": "Book updated successfully",
  "book": {
    "id": 1,
    "title": "Updated Book Title",
    "description": "Updated description",
    "pages": 400,
    ...
  }
}

// ========================

/**
 * 🗑️ حذف كتاب
 * DELETE http://localhost:3001/api/books/:id
 * Authorization: Bearer <token>
 */

// مثال:
DELETE http://localhost:3001/api/books/1

// استجابة متوقعة:
{
  "message": "Book deleted successfully"
}

// ========================
// 3️⃣ نظام المفضلة (Favorites)
// ========================

/**
 * ❤️ إضافة كتاب للمفضلة
 * POST http://localhost:3001/api/books/:id/favorite
 * Authorization: Bearer <token>
 */

// مثال:
POST http://localhost:3001/api/books/1/favorite

// استجابة متوقعة:
{
  "message": "Added to favorites"
}

// ========================

/**
 * 💔 إزالة كتاب من المفضلة
 * DELETE http://localhost:3001/api/books/:id/favorite
 * Authorization: Bearer <token>
 */

// مثال:
DELETE http://localhost:3001/api/books/1/favorite

// استجابة متوقعة:
{
  "message": "Removed from favorites"
}

// ========================
// 4️⃣ نظام AI (AI Q&A)
// ========================

/**
 * 💬 طرح سؤال على الكتاب
 * POST http://localhost:3001/api/ai/ask
 * Authorization: Bearer <token>
 * Content-Type: application/json
 */
{
  "book_id": 1,
  "question": "Who is the author of this book?"
}

// استجابة متوقعة:
{
  "question": "Who is the author of this book?",
  "answer": "The author of 'Sample Book' is John Doe.",
  "confidence_score": 0.95,
  "book_title": "Sample Book"
}

// ========================

/**
 * 📋 الحصول على سجل الأسئلة والأجوبة
 * GET http://localhost:3001/api/ai/history
 * Authorization: Bearer <token>
 */

// استجابة متوقعة:
[
  {
    "id": 1,
    "user_id": 1,
    "book_id": 1,
    "question": "Who is the author?",
    "answer": "John Doe",
    "confidence_score": 0.95,
    "book_title": "Sample Book",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]

// ========================

/**
 * ❓ الحصول على أسئلة تلقائية مقترحة
 * GET http://localhost:3001/api/ai/auto-questions/:book_id
 * Authorization: Bearer <token>
 */

// مثال:
GET http://localhost:3001/api/ai/auto-questions/1

// استجابة متوقعة:
{
  "book_id": 1,
  "book_title": "Sample Book",
  "questions": [
    "Who is the author of this book?",
    "What category does this book belong to?",
    "How many pages does this book have?",
    "What is the main theme of this book?",
    "When was this book published?"
  ]
}

// ========================
// 5️⃣ الفحص الصحي (Health Check)
// ========================

/**
 * 🏥 التحقق من حالة الخادم
 * GET http://localhost:3001/api/health
 * (بدون حاجة لـ Authorization)
 */

// استجابة متوقعة:
{
  "status": "Server is running",
  "database": "Connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

// ========================
// أمثلة في Terminal (curl)
// ========================

/**
 * تسجيل مستخدم جديد:
 */
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securePassword123!"
  }'

// ========================

/**
 * تسجيل دخول:
 */
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePassword123!"
  }'

// ========================

/**
 * الحصول على بيانات المستخدم (استبدل TOKEN بـ JWT token الفعلي):
 */
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

// ========================

/**
 * الحصول على جميع الكتب:
 */
curl -X GET http://localhost:3001/api/books

// ========================

/**
 * البحث عن كتب:
 */
curl -X GET "http://localhost:3001/api/books/search?q=harry"

// ========================

/**
 * إضافة كتاب جديد (من user مسؤول):
 */
curl -X POST http://localhost:3001/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "New Book",
    "author": "Author Name",
    "description": "Book description",
    "category": "Fiction",
    "published_year": 2024,
    "pages": 300,
    "cover_url": "https://example.com/cover.jpg",
    "file_url": "https://example.com/book.pdf"
  }'

// ========================

/**
 * إضافة كتاب للمفضلة:
 */
curl -X POST http://localhost:3001/api/books/1/favorite \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

// ========================

/**
 * طرح سؤال على الكتاب:
 */
curl -X POST http://localhost:3001/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "book_id": 1,
    "question": "Who is the author of this book?"
  }'

// ========================
// ✅ Postman Collection JSON
// ========================

/*
إذا كنت تستخدم Postman، يمكنك استيراد هذا الـ Collection:

{
  "info": {
    "name": "Library API",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:3001/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"securePassword123!\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:3001/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"securePassword123!\"\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Books",
      "item": [
        {
          "name": "Get All Books",
          "request": {
            "method": "GET",
            "url": "http://localhost:3001/api/books"
          }
        }
      ]
    }
  ]
}

اذهب إلى: https://www.postman.com/
اضغط على File → Import
الصق المحتوى أعلاه
*/

// ========================
// نصائح مهمة
// ========================

/**
 * 1. استبدل YOUR_TOKEN_HERE بـ JWT token الفعلي من تسجيل الدخول
 * 
 * 2. استخدم Postman لاختبار أسهل:
 *    - حمّل: https://www.postman.com/downloads/
 *    - إنشاء request جديد
 *    - اختر method (GET, POST, etc)
 *    - ادخل الـ URL
 *    - أضف headers و body
 *    - اضغط Send
 * 
 * 3. تأكد من تشغيل الخادم قبل الاختبار:
 *    cd server && npm run dev
 * 
 * 4. استخدم Status Code للتحقق:
 *    200 - OK
 *    201 - Created
 *    400 - Bad Request
 *    401 - Unauthorized
 *    403 - Forbidden
 *    404 - Not Found
 *    500 - Server Error
 * 
 * 5. جميع الـ endpoints الحساسة تحتاج Authorization header
 */
