@echo off
REM =====================================================
REM   مكتبة الأخلاق الرقمية - سكريبت البدء الآلي
REM   Digital Library - Automated Startup Script
REM =====================================================

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║     مكتبة الأخلاق الرقمية - Digital Library            ║
echo ║     النسخة 1.0 - Version 1.0                            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM =====================================================
REM   التحقق من المتطلبات المسبقة
REM =====================================================

echo [1/5] جارٍ التحقق من المتطلبات...
echo Checking prerequisites...
echo.

REM التحقق من Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js غير مثبت! الرجاء تثبيت Node.js من https://nodejs.org
    echo ❌ Node.js is not installed! Please install from https://nodejs.org
    pause
    exit /b 1
)

REM التحقق من MySQL
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  تحذير: MySQL لم يتم العثور عليه في المسار (Path)
    echo ⚠️  Warning: MySQL not found in PATH
    echo    تحقق من تثبيت MySQL وإضافته للـ PATH
    echo    Verify MySQL installation and add to PATH
    echo.
)

echo ✅ المتطلبات الأساسية متوفرة
echo ✅ Prerequisites check passed
echo.

REM =====================================================
REM   إعداد الخادم
REM =====================================================

echo [2/5] إعداد الخادم...
echo Setting up server...
echo.

cd server

if not exist node_modules (
    echo ⏳ تثبيت مكتبات الخادم... (هذا قد يستغرق دقائق)
    echo ⏳ Installing server packages... (this may take a few minutes)
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ❌ فشل تثبيت المكتبات
        echo ❌ Package installation failed
        cd ..
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت مكتبات الخادم
    echo ✅ Server packages installed
) else (
    echo ✅ مكتبات الخادم موجودة بالفعل
    echo ✅ Server packages already installed
)

if not exist .env (
    echo ⚠️  ملف .env غير موجود - سيتم استخدام الإعدادات الافتراضية
    echo ⚠️  .env file not found - using default settings
    echo    تأكد من ملف .env في مجلد server
    echo    Make sure .env exists in server folder
)

cd ..
echo.

REM =====================================================
REM   إعداد العميل
REM =====================================================

echo [3/5] إعداد العميل...
echo Setting up client...
echo.

cd client/my-react-app

if not exist node_modules (
    echo ⏳ تثبيت مكتبات العميل... (هذا قد يستغرق دقائق)
    echo ⏳ Installing client packages... (this may take a few minutes)
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ❌ فشل تثبيت المكتبات
        echo ❌ Package installation failed
        cd ../..
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت مكتبات العميل
    echo ✅ Client packages installed
) else (
    echo ✅ مكتبات العميل موجودة بالفعل
    echo ✅ Client packages already installed
)

cd ../..
echo.

REM =====================================================
REM   التشغيل
REM =====================================================

echo [4/5] جاري فتح المشروع...
echo Opening project...
echo.

REM فتح المجلد في Windows Explorer
start .
echo ✅ تم فتح مجلد المشروع في Windows Explorer
echo ✅ Project folder opened in Windows Explorer
echo.

REM =====================================================
REM   التعليمات النهائية
REM =====================================================

echo [5/5] التعليمات النهائية
echo Final Instructions
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║           كيفية تشغيل المشروع                            ║
echo ║        How to run the project                            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 📌 الخطوة الأولى - اقتح Terminal (اضغط Ctrl + `)
echo 📌 Step 1 - Open Terminal (Press Ctrl + `)
echo.

echo 🖥️  Terminal 1 - الخادم (Server):
echo    cd server
echo    npm run dev
echo.

echo    ← سيعمل الخادم على http://localhost:3001
echo    ← Server will run on http://localhost:3001
echo.

echo 🖥️  Terminal 2 - العميل (Client):
echo    cd client/my-react-app
echo    npm run dev
echo.

echo    ← سيعمل العميل على http://localhost:5173
echo    ← Client will run on http://localhost:5173
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║            📊 معلومات مهمة                               ║
echo ║        Important Information                             ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo ✅ النقاط الأساسية:
echo ✅ Basic Points:
echo.

echo 1️⃣  تأكد من تشغيل MySQL قبل بدء الخادم
echo    Make sure MySQL is running before starting server
echo.

echo 2️⃣  قاعدة البيانات ستُنشأ تلقائياً أول مرة
echo    Database will be created automatically on first run
echo.

echo 3️⃣  استخدم البيانات التالية للتسجيل الأول:
echo    Use following credentials for first login:
echo    البريد: admin@example.com / Email: admin@example.com
echo    كلمة المرور: admin123 / Password: admin123
echo.

echo 4️⃣  استخدم Terminal منفصلة للخادم والعميل
echo    Use separate terminals for server and client
echo.

echo 5️⃣  إذا حدثت مشاكل، تحقق من:
echo    If issues occur, check:
echo    - ملف .env في مجلد server
echo    - .env file in server folder
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║              🚀 جاهز للبدء!                              ║
echo ║            Ready to Start!                               ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo اضغط أي زر للمتابعة...
echo Press any key to continue...

pause

REM =====================================================
REM   ملخص المشروع
REM =====================================================

cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║          📚 مكتبة الأخلاق الرقمية   📚                    ║
echo ║        Digital Library - Complete System                 ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🎯 المميزات الرئيسية:
echo.
echo ✨ نظام مصادقة آمن عن طريق JWT Tokens
echo    Secure authentication system with JWT Tokens
echo.
echo ✨ إدارة الكتب الكاملة (CRUD)
echo    Complete book management (CRUD operations)
echo.
echo ✨ نموذج ذكاء اصطناعي لطرح الأسئلة
echo    AI model for asking questions about books
echo.
echo ✨ واجهة جميلة مع animations
echo    Beautiful UI with smooth animations
echo.
echo ✨ قاعدة بيانات MySQL محسّنة
echo    Optimized MySQL database
echo.
echo ✨ نظام الأدوار والأذونات
echo    Role-based access control system
echo.

echo ═══════════════════════════════════════════════════════════
echo.
echo اضغط أي زر لفتح الصفحة الرئيسية للتوثيق...
echo Press any key to open main documentation...
echo.
pause

REM فتح ملف README
if exist README.md (
    start README.md
)

exit /b 0
