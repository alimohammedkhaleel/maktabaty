#!/usr/bin/env pwsh

# دليل الاختبار الشامل - مكتبتي الذكية
# =========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 دليل الاختبار الشامل - مكتبتي الذكية" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. اختبار الخادم
Write-Host "📡 اختبار الخادم (Server)..." -ForegroundColor Green
$serverTest = try {
  $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -ErrorAction SilentlyContinue
  $response.StatusCode -eq 200
} catch {
  $false
}

if ($serverTest) {
  Write-Host "✅ الخادم يعمل على http://localhost:3001" -ForegroundColor Green
} else {
  Write-Host "❌ الخادم لا يعمل - شغّل: cd server && npm run dev" -ForegroundColor Red
  exit 1
}
Write-Host ""

# 2. اختبار العميل
Write-Host "🎨 اختبار العميل (Client)..." -ForegroundColor Green
$clientTest = try {
  $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -ErrorAction SilentlyContinue
  $response.StatusCode -eq 200
} catch {
  $false
}

if ($clientTest) {
  Write-Host "✅ العميل يعمل على http://localhost:5173" -ForegroundColor Green
} else {
  Write-Host "❌ العميل لا يعمل - شغّل: cd client/my-react-app && npm run dev" -ForegroundColor Red
  exit 1
}
Write-Host ""

# 3. اختبار الملفات الجديدة
Write-Host "📁 اختبار الملفات الجديدة..." -ForegroundColor Green

$filesToCheck = @(
  "client\my-react-app\src\pages\Home.jsx",
  "client\my-react-app\src\pages\Home.css",
  "client\my-react-app\src\hooks\useIntersectionObserver.js",
  "client\my-react-app\src\components\clientComponent\BookCard.jsx"
)

foreach ($file in $filesToCheck) {
  if (Test-Path $file) {
    Write-Host "✅ موجود: $file" -ForegroundColor Green
  } else {
    Write-Host "❌ مفقود: $file" -ForegroundColor Red
  }
}
Write-Host ""

# 4. اختبار API endpoints
Write-Host "🔌 اختبار API Endpoints..." -ForegroundColor Green

$endpoints = @(
  @{ Name = "Health Check"; Url = "http://localhost:3001/api/health"; Method = "GET" },
  @{ Name = "Get All Books"; Url = "http://localhost:3001/api/books"; Method = "GET" }
)

foreach ($endpoint in $endpoints) {
  try {
    $response = Invoke-WebRequest -Uri $endpoint.Url -Method $endpoint.Method -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401) {
      Write-Host "✅ $($endpoint.Name): $($response.StatusCode)" -ForegroundColor Green
    } else {
      Write-Host "❌ $($endpoint.Name): $($response.StatusCode)" -ForegroundColor Red
    }
  } catch {
    Write-Host "❌ $($endpoint.Name): خطأ في الاتصال" -ForegroundColor Red
  }
}
Write-Host ""

# 5. ملخص الاختبار
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 ملخص الاختبار" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ الخطوات التالية:" -ForegroundColor Yellow
Write-Host "1. افتح http://localhost:5173 في المتصفح" -ForegroundColor White
Write-Host "2. شاهد Home Page مع الرسوم المتحركة الجميلة" -ForegroundColor White
Write-Host "3. انقر 'ابدأ القراءة الآن' للتوجيه إلى الكتب" -ForegroundColor White
Write-Host "4. اختبر البحث والتصفية (debounce 300ms)" -ForegroundColor White
Write-Host "5. ادخل Admin Dashboard وأنشئ اختبار (30 سؤال)" -ForegroundColor White
Write-Host "6. افتح DevTools → Network لرؤية IntersectionObserver في العمل" -ForegroundColor White
Write-Host ""

Write-Host "🎉 كل شيء جاهز للاختبار!" -ForegroundColor Green
