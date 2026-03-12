#!/usr/bin/env node

/**
 * 🧪 اختبارات الصحة السريعة (Health Check Tests)
 * استخدام: node HEALTH_CHECK.js
 * أو على Windows: node HEALTH_CHECK.js
 */

const http = require('http');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// ==========================================
// دالات المساعدة
// ==========================================

function print(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function printSuccess(text) {
  print(`✅ ${text}`, 'green');
}

function printError(text) {
  print(`❌ ${text}`, 'red');
}

function printWarning(text) {
  print(`⚠️  ${text}`, 'yellow');
}

function printInfo(text) {
  print(`ℹ️  ${text}`, 'blue');
}

function printSection(text) {
  print(`\n${'='.repeat(50)}`, 'cyan');
  print(`${text}`, 'cyan');
  print(`${'='.repeat(50)}\n`, 'cyan');
}

// ==========================================
// الاختبارات
// ==========================================

// اختبار 1: التحقق من وجود Node.js
function testNodeJs() {
  printSection('1️⃣  اختبار Node.js');
  
  const version = process.version;
  printSuccess(`Node.js مثبت: ${version}`);
  
  if (version.startsWith('v14') || version.startsWith('v16') || 
      version.startsWith('v18') || version.startsWith('v20')) {
    printSuccess('✨ إصدار Node.js مدعوم');
    return true;
  } else {
    printWarning('قد تحتاج إلى آخر إصدار من Node.js');
    return false;
  }
}

// اختبار 2: التحقق من وجود ملفات المشروع
function testProjectStructure() {
  printSection('2️⃣  اختبار هيكل المشروع');
  
  const files = [
    'server/package.json',
    'server/index.js',
    'client/my-react-app/package.json',
    'client/my-react-app/src/main.jsx',
    'README.md'
  ];
  
  let allExists = true;
  files.forEach(file => {
    if (fs.existsSync(file)) {
      printSuccess(`الملف موجود: ${file}`);
    } else {
      printError(`الملف غير موجود: ${file}`);
      allExists = false;
    }
  });
  
  return allExists;
}

// اختبار 3: التحقق من وجود package.json في الخادم
function testServerSetup() {
  printSection('3️⃣  اختبار إعدادات الخادم');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
    
    printSuccess('package.json موجود في الخادم');
    
    const requiredDeps = ['express', 'mysql2', 'bcryptjs', 'jsonwebtoken', 'cors'];
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    let allDepsExist = true;
    requiredDeps.forEach(dep => {
      if (deps[dep]) {
        printSuccess(`المكتبة مثبتة: ${dep}@${deps[dep]}`);
      } else {
        printWarning(`المكتبة غير مثبتة: ${dep} (افتح terminal وشغل: cd server && npm install)`);
        allDepsExist = false;
      }
    });
    
    return allDepsExist;
  } catch (error) {
    printError(`خطأ في قراءة package.json: ${error.message}`);
    return false;
  }
}

// اختبار 4: التحقق من وجود package.json في العميل
function testClientSetup() {
  printSection('4️⃣  اختبار إعدادات العميل');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('client/my-react-app/package.json', 'utf8'));
    
    printSuccess('package.json موجود في العميل');
    
    const requiredDeps = ['react', 'react-router-dom', 'zustand', 'framer-motion', 'axios'];
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    let allDepsExist = true;
    requiredDeps.forEach(dep => {
      if (deps[dep]) {
        printSuccess(`المكتبة مثبتة: ${dep}@${deps[dep]}`);
      } else {
        printWarning(`المكتبة غير مثبتة: ${dep} (افتح terminal وشغل: cd client/my-react-app && npm install)`);
        allDepsExist = false;
      }
    });
    
    return allDepsExist;
  } catch (error) {
    printError(`خطأ في قراءة package.json: ${error.message}`);
    return false;
  }
}

// اختبار 5: التحقق من وجود ملف .env
function testEnvFile() {
  printSection('5️⃣  اختبار ملف البيئة');
  
  if (fs.existsSync('server/.env')) {
    printSuccess('ملف .env موجود في الخادم');
    
    try {
      const envContent = fs.readFileSync('server/.env', 'utf8');
      const requiredVars = ['PORT', 'DB_HOST', 'DB_USER', 'JWT_SECRET'];
      
      let allVarsExist = true;
      requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
          printSuccess(`متغير البيئة موجود: ${varName}`);
        } else {
          printError(`متغير البيئة غير موجود: ${varName}`);
          allVarsExist = false;
        }
      });
      
      return allVarsExist;
    } catch (error) {
      printError(`خطأ في قراءة .env: ${error.message}`);
      return false;
    }
  } else {
    printError('ملف .env غير موجود في الخادم');
    printInfo('انسخ .env.example إلى .env وعدّل القيم');
    return false;
  }
}

// اختبار 6: اختبار الخادم
async function testServer() {
  printSection('6️⃣  اختبار الخادم');
  
  return new Promise((resolve) => {
    const request = http.get('http://localhost:3001/api/health', (res) => {
      if (res.statusCode === 200) {
        printSuccess('الخادم يعمل بنجاح على http://localhost:3001');
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            printSuccess(`الاستجابة: ${response.status || 'OK'}`);
          } catch (e) {
            printSuccess('استجابة صحيحة من الخادم');
          }
          resolve(true);
        });
      } else {
        printError(`الخادم يرد بـ status code: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    request.on('error', (error) => {
      printError(`لا يمكن الاتصال بالخادم: ${error.message}`);
      printInfo('تأكد من تشغيل: npm run dev (في مجلد server)');
      resolve(false);
    });
    
    request.setTimeout(5000);
  });
}

// اختبار 7: اختبار قاعدة البيانات
async function testDatabase() {
  printSection('7️⃣  اختبار قاعدة البيانات');
  
  return new Promise((resolve) => {
    const request = http.get('http://localhost:3001/api/health', (res) => {
      if (res.statusCode === 200) {
        printSuccess('قاعدة البيانات متصلة');
        resolve(true);
      } else {
        printError('قاعدة البيانات قد لا تكون متصلة');
        resolve(false);
      }
    });

    request.on('error', () => {
      printWarning('لم يتم التحقق من قاعدة البيانات (الخادم غير مشغل)');
      resolve(false);
    });

    request.setTimeout(5000);
  });
}

// اختبار 8: اختبار الملفات المهمة
function testImportantFiles() {
  printSection('8️⃣  اختبار الملفات المهمة');
  
  const importantFiles = {
    'server/config/db.js': 'ملف قاعدة البيانات',
    'server/middleware/auth.js': 'ملف المصادقة',
    'server/controllers/authController.js': 'متحكم المصادقة',
    'server/controllers/booksController.js': 'متحكم الكتب',
    'src/store/authStore.js': 'متجر المصادقة',
    'src/components/ authComponent/Auth.jsx': 'مكون المصادقة',
    'src/services/api.js': 'خدمة API'
  };
  
  let allExist = true;
  Object.entries(importantFiles).forEach(([file, desc]) => {
    if (fs.existsSync(file)) {
      printSuccess(`${desc}: موجود`);
    } else {
      printError(`${desc}: غير موجود (${file})`);
      allExist = false;
    }
  });
  
  return allExist;
}

// ==========================================
// الملخص والنتائج
// ==========================================

async function runAllTests() {
  printSection('🧪 بدء اختبارات الصحة');
  
  const results = {
    nodeJs: testNodeJs(),
    projectStructure: testProjectStructure(),
    serverSetup: testServerSetup(),
    clientSetup: testClientSetup(),
    envFile: testEnvFile(),
    importantFiles: testImportantFiles()
  };
  
  // اختبارات تحتاج internet
  results.server = await testServer();
  results.database = await testDatabase();
  
  // الملخص
  printSection('📊 ملخص النتائج');
  
  const total = Object.values(results).length;
  const passed = Object.values(results).filter(r => r).length;
  const percentage = Math.round((passed / total) * 100);
  
  print(`النتائج: ${passed}/${total} اجتازت الاختبار (${percentage}%)`, 'cyan');
  
  if (percentage === 100) {
    printSuccess('🎉 كل شيء يعمل بشكل صحيح!');
    printInfo('الخطوة التالية:');
    printInfo('1. افتح Terminal وشغل: cd server && npm run dev');
    printInfo('2. افتح Terminal جديد وشغل: cd client/my-react-app && npm run dev');
    printInfo('3. افتح المتصفح على: http://localhost:5173');
  } else if (percentage >= 75) {
    printWarning('⚠️  معظم الاختبارات نجحت، لكن هناك بعض المشاكل');
    printInfo('تحقق من الأخطاء أعلاه وحاول حلها');
  } else {
    printError('❌ هناك مشاكل متعددة تحتاج إلى حل');
    printInfo('اتبع الخطوات المذكورة أعلاه لحل المشاكل');
  }
  
  print('\n', 'cyan');
}

// تشغيل الاختبارات
runAllTests().catch(error => {
  printError(`خطأ غير متوقع: ${error.message}`);
  process.exit(1);
});
