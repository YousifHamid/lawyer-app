# تطبيق المحامين - المشروع الكامل

## المحتويات
- `backend/` — سيرفر Node.js + Express + SQLite (Sequelize)
- `mobile/` — تطبيق React Native (Expo) - حساب واحد بدورين: عميل / محامي

## تشغيل الباكند
```bash
cd backend
cp .env.example .env
npm install
npm run seed      # لإدخال المناطق الأساسية
npm run dev        # تشغيل السيرفر على http://localhost:4000
```

## تشغيل تطبيق الموبايل
```bash
cd mobile
npm install
```
قبل التشغيل، افتح `mobile/src/api/client.js` وغيّر:
```js
const BASE_URL = 'http://192.168.1.100:4000/api';
```
إلى عنوان IP جهازك على نفس الشبكة (استخدم `ipconfig` على ويندوز لمعرفته)، حتى يقدر تطبيق الموبايل (على هاتفك عبر تطبيق Expo Go) يوصل للسيرفر الشغال على جهازك.

بعدها:
```bash
npx expo start
```
وامسح رمز QR بتطبيق **Expo Go** من هاتفك.

## نقاط API الأساسية
| Method | Endpoint | الوصف |
|---|---|---|
| POST | /api/auth/register | تسجيل حساب جديد (عميل/محامي) |
| POST | /api/auth/login | تسجيل الدخول |
| GET | /api/lawyers | قائمة المحامين (فلترة بـ specialty/region_id) |
| GET | /api/lawyers/:id | بروفايل محامي + خدماته |
| PUT | /api/lawyers/me | تعديل بروفايل المحامي |
| POST | /api/services | إضافة خدمة (محامي) |
| GET | /api/services/mine | خدمات المحامي الحالي |
| POST | /api/requests | عميل يطلب خدمة |
| GET | /api/requests/mine | طلبات العميل |
| GET | /api/requests/incoming | الطلبات الواردة للمحامي |
| PUT | /api/requests/:id/status | تحديث حالة الطلب |
| GET | /api/regions | قائمة المناطق |

## ملاحظات مهمة
1. العمولة تُحسب تلقائياً عند إنشاء الطلب حسب `COMMISSION_PERCENT` في `.env` (افتراضي 10%).
2. حسابات المحامين تحتاج توثيق يدوي (`is_verified = true`) — حالياً تحتاج تفعيلها يدوياً من قاعدة البيانات لحين بناء لوحة الأدمن (المرحلة القادمة).
3. الصور تُخزن محلياً في `backend/uploads/` — عند النشر الفعلي يُفضل استخدام تخزين سحابي (S3 أو مشابه).
4. لتشغيل التطبيق على هاتف حقيقي بدون Expo Go، تحتاج عمل build عبر `eas build` — خطوة لاحقة عند الجاهزية للنشر.

## الخطوات القادمة المقترحة
1. لوحة أدمن (ويب) لتفعيل توثيق المحامين ومتابعة العمولات
2. نظام تقييمات بعد اكتمال الطلب
3. بحث حسب أقرب موقع (GPS) بدل الفلترة اليدوية فقط
4. دفع إلكتروني تلقائي بدل التسجيل اليدوي
