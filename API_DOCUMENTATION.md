# 📡 API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
جميع الـ requests تحتاج إلى Bearer Token في الـ header:
```
Authorization: Bearer {token}
```

---

## 🔓 Public Endpoints (بدون توثيق)

### تسجيل مستخدم جديد
```
POST /auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securePassword123!"
}

✅ Response (201):
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### دخول المستخدم
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}

✅ Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

## 📚 Books Endpoints

### الحصول على جميع الكتب
```
GET /books

✅ Response (200):
{
  "success": true,
  "books": [
    {
      "id": 1,
      "title": "Sample Book",
      "author": "John Doe",
      "description": "A great book",
      "category": "Fiction",
      "published_year": 2024,
      "pages": 256,
      "cover_url": "https://...",
      "pdf_url": "https://...",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### البحث عن كتاب
```
GET /books/search?q=harry

✅ Response (200):
{
  "success": true,
  "books": [...]
}
```

### الحصول على كتاب واحد
```
GET /books/:id

✅ Response (200):
{
  "success": true,
  "book": {...}
}
```

### إضافة كتاب جديد (Admin فقط)
```
POST /books
Content-Type: multipart/form-data (أو application/json)

{
  "title": "New Book Title",
  "author": "Author Name",
  "description": "Book description",
  "category": "Fiction",
  "published_year": 2024,
  "pages": 300,
  "pdfFile": <binary PDF data>  // optional
}

✅ Response (201):
{
  "success": true,
  "message": "Book created successfully",
  "book": {...}
}
```

### حذف كتاب (Admin فقط)
```
DELETE /books/:id

✅ Response (200):
{
  "success": true,
  "message": "Book deleted successfully"
}
```

---

## 🎯 Quiz Endpoints

### إنشاء اختبار فارغ (Admin فقط)
```
POST /quizzes
Content-Type: application/json

{
  "book_id": 1
}
```

✅ Response (201):
```
{
  "success": true,
  "quizId": 42
}
```

> بعد إنشاء الاختبار يمكن تعديل الأسئلة يدويًا أو نشره.

---

### توليد اختبار من كتاب (Admin فقط)
```
POST /quizzes/generate
Content-Type: application/json

{
  "book_id": 1,
  "num_questions": 30  // optional, default = 30
}

✅ Response (201):
{
  "success": true,
  "message": "Quiz generated successfully",
  "quiz": {
    "id": 1,
    "book_id": 1,
    "questions": [
      {
        "id": 1,
        "question": "ما هو عنوان الكتاب؟",
        "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
        "answerIndex": 0,
        "explanation": "التفسير"
      },
      ...
    ]
  }
}
```

### نشر اختبار (Admin فقط)
```
POST /quizzes/:id/publish
Content-Type: application/json

{
  "is_published": true
}

✅ Response (200):
{
  "success": true,
  "message": "Quiz published successfully"
}
```

### تحديث سؤال (Admin فقط)
```
PUT /quizzes/question/:question_id
Content-Type: application/json

{
  "question": "النص الجديد للسؤال",
  "options": ["خيار1","خيار2","خيار3","خيار4"],
  "answerIndex": 2
}

✅ Response (200):
{
  "success": true,
  "message": "Question updated"
}
```

### حذف سؤال من اختبار (Admin فقط)
```
DELETE /quizzes/question/:question_id

✅ Response (200):
{
  "success": true,
  "message": "Question deleted"
}
```

### إضافة سؤال يدوي إلى اختبار (Admin فقط)
```
POST /quizzes/:quiz_id/question
Content-Type: application/json

{
  "question": "سؤال جديد",
  "options": ["أ","ب","ج","د"],
  "answerIndex": 0
}

✅ Response (201):
{
  "success": true,
  "message": "Question added",
  "questionId": 123
}
```

### إعادة توليد الأسئلة (Admin فقط)
```
POST /quizzes/regenerate/:quiz_id

✅ Response (200):
{
  "success": true,
  "message": "Quiz regenerated",
  "questions": [ /* new list of 30 questions */ ]
}
```

### حذف اختبار (Admin فقط)
```
DELETE /quizzes/:quiz_id

✅ Response (200):
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

### الحصول على جميع الاختبارات (Admin فقط)
```
GET /quizzes/all

✅ Response (200):
{
  "success": true,
  "quizzes": [
    {"id":1,"book_id":2,"title":"Quiz for book","published":0,"book_title":"Book name"},
    ...
  ]
}
```

### لوحة الترتيب العالمية
```
GET /quizzes/global-leaderboard

✅ Response (200):
{
  "success": true,
  "leaderboard": [
    {"user_id":5,"username":"ali","total_score":150},
    ...
  ]
}
```


### الحصول على اختبار منشور
```
GET /quizzes/:id

✅ Response (200):
{
  "success": true,
  "quiz": {
    "id": 1,
    "title": "...",
    "questions": [ /* as above */ ],
    "is_published": true
  }
}
```

### إرسال نتائج الاختبار (طالب)
```
POST /quizzes/submit/:quiz_id
Content-Type: application/json

{
  "answers": [
    { "question_id": 10, "answerIndex": 2 },
    { "question_id": 11, "answerIndex": 0 },
    ...
  ]
}

✅ Response (200):
{
  "success": true,
  "score": 25,
  "totalQuestions": 30,
  "rank": 4,            // ترتيبك بين المجيبِينَ (1 تعني الأفضل)
  "bonus": 10          // نقاط إضافية بحسب ترتيبك
}
```

### الحصول على لوحة الترتيب
```
GET /quizzes/leaderboard/:quiz_id

✅ Response (200):
{
  "success": true,
  "leaderboard": [
    {
      "user_id": 5,
      "username": "ali",
      "score": 28,
      "total_questions": 30,
      "percentage": 93,
      "created_at": "2025-02-20T12:00:00.000Z"
    },
    ...
  ]
}
```

### الحصول على قائمة الاختبارات
```
GET /quizzes

✅ Response (200):
{
  "success": true,
  "quizzes": [
    {
      "id": 1,
      "book_id": 1,
      "book_title": "Sample Book",
      "total_questions": 30,
      "is_published": true,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### الحصول على اختبار واحد
```
GET /quizzes/:id

✅ Response (200):
{
  "success": true,
  "quiz": {
    "id": 1,
    "book_id": 1,
    "book_title": "Sample Book",
    "questions": [...],
    "is_published": true
  }
}
```

### تقديم إجابات الاختبار
```
POST /quizzes/:id/submit
Content-Type: application/json

{
  "answers": [
    { "question_id": 1, "selected_index": 0 },
    { "question_id": 2, "selected_index": 2 },
    ...
  ]
}

✅ Response (201):
{
  "success": true,
  "message": "Quiz submitted successfully",
  "result": {
    "id": 1,
    "user_id": 1,
    "quiz_id": 1,
    "score": 25,
    "total_questions": 30,
    "percentage": 83.33,
    "submitted_at": "2024-01-15T11:30:00.000Z"
  }
}
```

### لوحة الترتيب (Leaderboard)
```
GET /quizzes/:id/leaderboard

✅ Response (200):
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "username": "top_user",
      "score": 30,
      "percentage": 100,
      "submitted_at": "2024-01-15T11:30:00.000Z"
    },
    {
      "rank": 2,
      "username": "second_user",
      "score": 28,
      "percentage": 93.33,
      "submitted_at": "2024-01-15T11:35:00.000Z"
    }
  ]
}
```

---

## 👤 User Endpoints

### الحصول على ملف المستخدم
```
GET /auth/profile

✅ Response (200):
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "avatar_url": null,
    "role": "user",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

> **ملاحظة:** الاستجابة الآن قد تحتوي أيضاً على الحقول التالية:
> - `totalPoints`: مجموع نقاط المستخدم عبر جميع الاختبارات.
> - `globalRank`: ترتيب المستخدم بين جميع المسجلين حسب مجموع النقاط.

### تحديث ملف المستخدم
```
PUT /auth/profile
Content-Type: application/json

{
  "username": "newusername",
  "avatar_url": "https://example.com/avatar.png"
}

✅ Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {...}
}
```

---

## ❤️ Favorites Endpoints

### إضافة كتاب للمفضلة
```
POST /books/:id/favorite

✅ Response (201):
{
  "success": true,
  "message": "Added to favorites"
}
```

### إزالة من المفضلة
```
DELETE /books/:id/favorite

✅ Response (200):
{
  "success": true,
  "message": "Removed from favorites"
}
```

### الحصول على المفضلة
```
GET /favorites

✅ Response (200):
{
  "success": true,
  "favorites": [...]
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid input",
  "error": "specific error details"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - token required",
  "error": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden - admin access required",
  "error": "Only admins can perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Book with id 999 not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Internal server error details"
}
```

---

## 🔑 Authentication Flow

```
1. User → POST /auth/register
2. Server → returns token + user
3. Client → localStorage.setItem('token', token)
4. Client → axios adds token to each request header
5. Any endpoint → validates token
6. Invalid token → 401 response
7. Client → clears token + redirects to /login
```

---

## 🧪 cURL Examples

### تسجيل مستخدم
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securePWD123!"
  }'
```

### الحصول على الكتب (مع token)
```bash
curl -X GET http://localhost:3001/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### توليد اختبار
```bash
curl -X POST http://localhost:3001/api/quizzes/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "num_questions": 30
  }'
```

---

## 📊 Response Codes Summary

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

**آخر تحديث:** يناير 2024  
**الإصدار:** 2.0.0  
**الحالة:** ✅ موثق بالكامل
