# دليل النشر على Vercel (الطريقة الجديدة 2026) 🚀

تم تجهيز البنية التحتية بالكامل لتتوافق مع **Vercel Serverless Functions** و **Neon PostgreSQL**. 
هذا الدليل يوضح خطوات الرفع خطوة بخطوة للباك إند والفرونت إند.

---

## 1️⃣ رفع الباك إند (Server) على Vercel

تم تحويل الباك إند من تطبيق Express يعمل طوال الوقت (Monolithic) إلى دوال تعمل عند الطلب (Serverless) لتلائم بيئة Vercel، مع توجيه الرفع وحفظ الملفات (PDF) إلى مجلد `/tmp` الخاص بـ Vercel.

**الخطوات:**
1. اذهب إلى موقع [Vercel](https://vercel.com/) وقم بتسجيل الدخول.
2. اضغط على **"Add New..."** ثم اختر **"Project"**.
3. قم باختيار مستودع GitHub الخاص بك الذي يحتوي على مجلد `server`.
4. في إعدادات المشروع (Configure Project):
   - **Framework Preset**: اتركه `Other`.
   - **Root Directory**: اضغط على `Edit` واختر المجلد `server`.
5. في قسم **Environment Variables**، قم بنسخ المتغيرات التالية من ملف `.env`:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_SCXm3eVd8GJb@ep-empty-field-axrkwvzp-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=maktabaty_super_secret_jwt_key_2026_change_in_production
   JWT_EXPIRE=7d
   FRONTEND_URL=https://maktabatyy.vercel.app
   GEMINI_API_KEY=AIzaSyAskyJ3CPSQJbdH112TLXaS36Z4HakArJg
   NODE_ENV=production
   ```
6. اضغط على **Deploy** وانتظر حتى يكتمل النشر.
7. انسخ الرابط الذي سيعطيه لك Vercel (مثال: `https://maktabaty-server.vercel.app`).

---

## 2️⃣ تحديث ورفع الفرونت إند (Client)

الآن بعد أن أصبح لديك رابط الباك إند جاهزاً، عليك تحديث مشروع الـ React ليتصل به.

**الخطوات:**
1. افتح ملف `.env` الموجود داخل `client/my-react-app`.
2. قم بتحديث قيمة الـ URL بالرابط الجديد الخاص بالباك إند:
   ```env
   VITE_API_URL=https://maktabaty-server.vercel.app/api
   ```
   *(استبدل `maktabaty-server.vercel.app` بالرابط الحقيقي الخاص بك)*
3. قم بعمل `Commit` و `Push` لهذه التغييرات إلى GitHub.
4. اذهب إلى مشروع الفرونت إند الخاص بك على Vercel (الذي يملك الرابط `maktabatyy.vercel.app`).
5. في إعدادات مشروع الفرونت إند، اذهب إلى **Settings > Environment Variables** وتأكد من إضافة/تحديث:
   - `VITE_API_URL` بقيمة رابط الباك إند الجديد.
6. اذهب إلى قائمة **Deployments** واضغط على الزر لإعادة النشر (Redeploy) حتى يأخذ المتغير الجديد.

---

## 3️⃣ ملاحظات مهمة جداً (تم حلها وتجهيزها في الكود)

- **قاعدة البيانات**: نحن الآن نستخدم **PostgreSQL** مستضافة على **Neon.tech** بدلاً من MySQL المحلية. الداتا الأساسية وحسابات الاختبار (مثل `admin@example.com` و `test@example.com`) موجودة الآن بالفعل بفضل سكريبت `seed.js` الذي قمنا بتشغيله.
- **تخزين الملفات (PDFs)**: Vercel يعطي نظام ملفات "للقراءة فقط" باستثناء مجلد `/tmp`. تم تعديل مكتبة `multer` لدينا لحفظ ملفات الكتب المرفوعة تلقائياً في `/tmp/uploads` عند العمل على Vercel، و `uploads` عند العمل محلياً.
- **الـ CORS**: تم ضبط الباك إند ليقبل الطلبات القادمة من الروابط:
  - `https://maktabatyy.vercel.app`
  - `https://maktabaty.vercel.app`
  - `http://localhost:5173`

تهانينا! 🎉 نظامك الآن يستخدم تقنيات Serverless وฐาน بيانات سحابية متقدمة وهو جاهز للعمل.
