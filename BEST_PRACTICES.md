# 📖 أفضل الممارسات (Best Practices)

## 🎯 أهداف هذا الملف

توثيق أفضل الممارسات عند العمل على المشروع لضمان:
- ✅ كود نظيف وسهل الصيانة
- ✅ أمان قوي
- ✅ أداء عالي
- ✅ تعاون فعال مع الفريق

---

## 🖥️ الخادم (Backend)

### 1. إدارة الأخطاء

**❌ غير صحيح:**
```javascript
app.post('/api/books', (req, res) => {
  const result = pool.query('INSERT INTO books...');
  res.json(result);
});
```

**✅ صحيح:**
```javascript
app.post('/api/books', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO books...');
    res.status(201).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

### 2. التحقق من المدخلات (Input Validation)

**❌ غير صحيح:**
```javascript
app.post('/api/books', async (req, res) => {
  const { title, author } = req.body;
  const [result] = await pool.query('INSERT INTO books...');
  res.json(result);
});
```

**✅ صحيح:**
```javascript
app.post('/api/books', async (req, res) => {
  const { title, author, description } = req.body;
  
  // التحقق الأساسي
  if (!title || !author) {
    return res.status(400).json({ 
      message: 'Title and author are required' 
    });
  }
  
  if (title.length < 3 || title.length > 100) {
    return res.status(400).json({ 
      message: 'Title must be between 3 and 100 characters' 
    });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO books (title, author) VALUES (?, ?)',
      [title, author]
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 3. الاستخدام الآمن لقاعدة البيانات

**❌ غير آمن (SQL Injection):**
```javascript
const result = pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**✅ آمن (Parameterized):**
```javascript
const [result] = await pool.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
```

### 4. إخفاء حساسيات الأمان

**❌ غير آمن:**
```javascript
res.json({ 
  password_hash: user.password_hash,  // ❌ لا تفضح كلمة المرور
  email: user.email
});
```

**✅ آمن:**
```javascript
const { password_hash, ...userData } = user;
res.json(userData);
```

### 5. تسجيل الأخطاء (Logging)

**❌ غير كافي:**
```javascript
console.log('error');
```

**✅ كافي:**
```javascript
console.error('[AUTH_ERROR]', new Date().toISOString(), {
  endpoint: '/api/auth/login',
  email: email,
  reason: error.message
});

// أو استخدم مكتبة متقدمة:
logger.error('Login failed', {
  email,
  ip: req.ip,
  timestamp: new Date(),
  error: error.message
});
```

### 6. استخدام Middleware بشكل صحيح

**❌ غير منظم:**
```javascript
app.post('/api/books', (req, res) => {
  // تحقق من التوكن هنا
  const token = req.headers.authorization;
  if (!token) return res.status(401).json(...);
  
  // ... باقي الكود
});
```

**✅ منظم:**
```javascript
// في middleware/auth.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// في الـ routes:
router.post('/books', verifyToken, booksController.addBook);
```

### 7. معالجة الملفات بأمان

**❌ غير آمن:**
```javascript
app.post('/upload', multer().single('file'), (req, res) => {
  fs.writeFileSync(req.file.originalname, req.file.buffer);
  res.json({ filename: req.file.originalname });
});
```

**✅ آمن:**
```javascript
const upload = multer({
  dest: './uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB فقط
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  const filename = `${Date.now()}_${req.file.originalname}`;
  const filepath = path.join('./uploads/', filename);
  fs.renameSync(req.file.path, filepath);
  res.json({ filename });
});
```

---

## ⚛️ الواجهة الأمامية (Frontend)

### 1. استخدام State بشكل صحيح

**❌ غير صحيح:**
```javascript
let user = null;  // ❌ متغير عام
export default function App() {
  return <div>{user?.name}</div>;
}
```

**✅ صحيح:**
```javascript
import { useAuthStore } from '../store/authStore';

export default function App() {
  const { user } = useAuthStore();
  return <div>{user?.name}</div>;
}
```

### 2. معالجة الأخطاء بالكامل

**❌ غير كامل:**
```javascript
const handleLogin = async () => {
  const result = await authService.login(email, password);
  setUser(result.user);
};
```

**✅ كامل:**
```javascript
const handleLogin = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await authService.login(email, password);
    
    if (!result || !result.user) {
      throw new Error('Invalid response from server');
    }
    
    setUser(result.user);
    navigate('/library');
  } catch (error) {
    setError(error.message || 'Login failed');
    console.error('Login error:', error);
  } finally {
    setLoading(false);
  }
};
```

### 3. استخدام Hooks بشكل صحيح

**❌ غير صحيح (إساءة استخدام useEffect):**
```javascript
function Books() {
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    fetch('/api/books').then(r => r.json()).then(setBooks);
  }); // ❌ يعيد جلب البيانات في كل render!
  
  return <div>{books.length}</div>;
}
```

**✅ صحيح:**
```javascript
function Books() {
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      }
    };
    
    fetchBooks();
  }, []); // ✅ يعمل مرة واحدة عند التحميل
  
  return <div>{books.length}</div>;
}
```

### 4. تقسيم المكونات

**❌ مكون واحد ضخم:**
```javascript
function UserProfile() {
  // 500 سطر من الكود!
  return (
    <div>
      {/* البيانات الشخصية */}
      {/* قائمة الكتب المفضلة */}
      {/* نموذج تحديث الملف الشخصي */}
      {/* الإحصائيات */}
    </div>
  );
}
```

**✅ مكونات صغيرة:**
```javascript
// UserInfo.jsx
function UserInfo() {
  const { user } = useAuthStore();
  return <div>{user?.name}</div>;
}

// UserFavorites.jsx
function UserFavorites() {
  const { favorites } = useBooksStore();
  return <div>{favorites.length} books</div>;
}

// UserProfile.jsx
function UserProfile() {
  return (
    <div>
      <UserInfo />
      <UserFavorites />
      <UserForm />
      <UserStats />
    </div>
  );
}
```

### 5. استخدام المكتبات بشكل صحيح

**❌ إساءة استخدام Framer Motion:**
```javascript
// تحريك كل شيء! مما يسبب بطء
<motion.div animate={{ x: 100 }} transition={{ duration: 10 }} />
<motion.button animate={{ scale: 1.1 }} transition={{ duration: 5 }} />
<motion.p animate={{ rotate: 360 }} transition={{ duration: 8 }} />
```

**✅ استخدام ذكي:**
```javascript
// حرك فقط ما هو مهم للتجربة
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }} // سريع!
/>

// استخدم CSS للحركات البسيطة
.button:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
```

### 6. أداء الصور

**❌ أداء سيء:**
```javascript
<img src="https://big-image-5mb.jpg" />  // صورة ضخمة
```

**✅ أداء جيد:**
```javascript
import { lazy, Suspense } from 'react';

// تحميل كسول
const BookCover = lazy(() => import('./BookCover'));

<Suspense fallback={<div>Loading...</div>}>
  <BookCover src="image-optimized-500kb.jpg" />
</Suspense>

// أو استخدم WebP مع fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Book" />
</picture>
```

### 7. أمان البيانات الحساسة

**❌ خطر (تخزين كلمة السر):**
```javascript
localStorage.setItem('password', password);  // ❌ خطر!
```

**✅ آمن:**
```javascript
// تخزين التوكن فقط، وليس كلمة السر
localStorage.setItem('auth_token', token);  // ✅ آمن
localStorage.setItem('user_email', email);  // ✅ معلومة عامة آمنة

// احذف عند تسجيل الخروج
localStorage.removeItem('auth_token');
```

---

## 🗄️ قاعدة البيانات

### 1. استخدام Indexes

**❌ بطيء:**
```javascript
// بدون index - البحث يتفحص كل الصفوف
SELECT * FROM books WHERE email = 'test@email.com';
```

**✅ سريع:**
```sql
-- أضف index
CREATE INDEX idx_email ON users(email);

-- الآن البحث أسرع بكثير
SELECT * FROM books WHERE email = 'test@email.com';
```

### 2. استخدام Prepared Statements دائماً

**❌ معرض للخطر:**
```javascript
const result = pool.query(`SELECT * FROM users WHERE id = ${id}`);
```

**✅ آمن:**
```javascript
const [result] = await pool.query(
  'SELECT * FROM users WHERE id = ?',
  [id]
);
```

### 3. Normalization

**❌ بيانات غير منظمة:**
```sql
-- كل بيانات المستخدم في جدول واحد
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  book_title VARCHAR(100),  -- ❌ تكرار البيانات!
  book_author VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**✅ بيانات منظمة:**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE books (
  id INT PRIMARY KEY,
  title VARCHAR(100),
  author VARCHAR(100),
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 📁 تنظيم الملفات

### هيكل صحيح:

```
server/
├── config/              # إعدادات
│   ├── db.js
│   └── initDB.js
├── middleware/          # middleware
│   └── auth.js
├── controllers/         # منطق الأعمال
│   ├── authController.js
│   └── booksController.js
├── routes/              # الـ routes
│   ├── authRoutes.js
│   └── booksRoutes.js
├── index.js            # نقطة الدخول الرئيسية
└── .env                # متغيرات البيئة

client/
├── src/
│   ├── components/     # المكونات
│   │   ├── authComponent/
│   │   ├── adminComponent/
│   │   └── clientComponent/
│   ├── services/       # خدمات API
│   │   ├── api.js
│   │   └── authService.js
│   ├── store/          # state management
│   │   └── authStore.js
│   ├── App.jsx
│   └── main.jsx
```

---

## 🔒 الأمان

### 1. الحد من معدل الطلبات

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
  message: 'Too many requests'
});

app.use('/api/auth', limiter);
```

### 2. HTTPS دائماً

```javascript
// في الإنتاج
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. CORS محدود

```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
```

### 4. حماية Headers

```javascript
const helmet = require('helmet');
app.use(helmet());

// أو يدويا:
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

---

## 📚 قائمة المراجعة (Checklist)

قبل رفع الكود (Commit):

- [ ] الكود مختبر ويعمل بدون أخطاء
- [ ] لا توجد بيانات حساسة في الكود
- [ ] تم اتباع معايير تسمية المتغيرات
- [ ] المكونات صغيرة وقابلة للإعادة
- [ ] معالجة الأخطاء موجودة
- [ ] الدوال لها توثيق (comments)
- [ ] لا يوجد `console.log` عشوائي (في الإنتاج)
- [ ] الكود سهل الفهم

قبل النشر على الإنتاج:

- [ ] تم اختبار جميع المجالات
- [ ] تم مراجعة الأمان من قبل شخص آخر
- [ ] تم تحضير خطة الاستعادة (Rollback)
- [ ] تم عمل نسخة احتياطية من قاعدة البيانات
- [ ] تم اختبار الأداء
- [ ] تم إعداد المراقبة والـ logs
- [ ] تم توثيق التغييرات
- [ ] تم إخطار الفريق بخطة النشر

---

## 📖 مراجع مفيدة

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev)
- [OWASP Security](https://owasp.org)
- [MySQL Performance](https://dev.mysql.com)
- [JavaScript Conventions](https://google.github.io/styleguide/jsguide.html)

---

**ذكري:** الكود الجيد ليس فقط عن أن يعمل، بل أن يكون سهل الفهم والصيانة! 🎯
