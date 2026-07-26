# 🌐 دليل خطوة بخطوة لرفع وتشغيل خادم الباك إند على السيرفر (Backend Server Deployment Guide)
### تطبيق محاميك للخدمات والتوثيقات القانونية بالسودان 2026م

يقدم هذا المستند دليلاً شاملاً وعملياً لرفع وتثبيت وتشغيل خادم الباك إند (`Node.js / Express / SQLite / PostgreSQL`) على سيرفر سحابي خاص (VPS مثل VPS Linux / Ubuntu / AWS / DigitalOcean / Hetzner) وضبط التشفير وتجديد شهادة الأمان SSL وتكوين النطاق (Domain).

---

## 📋 1. متطلبات السيرفر التشغيلية (Server Requirements)

* **نظام التشغيل:** Linux Ubuntu 20.04 / 22.04 / 24.04 LTS.
* **الذاكرة العشوائية (RAM):** 1GB كحد أدنى (يُفضل 2GB).
* **اسم نطاق (Domain):** مثلاً `api.lawyer-app.sd` أو `lawyer-app.sd`.
* **الوصول للسيرفر:** صلاحيات جذرية عبر SSH (`Root Access`).

---

## 🛠️ 2. الخطوة الأولى: تجهيز وتحديث السيرفر (System Preparation)

افتح مبدل الأوامر ورابط الـ SSH الخاص بسيرفرك، واكتب الأوامر التالية:

```bash
# 1. تحديث حزم وتطبيقات النظام
sudo apt update && sudo apt upgrade -y

# 2. تثبيت أدوات Git و Curl وبناء البرمجيات
sudo apt install -y git curl build-essential nginx certbot python3-certbot-nginx

# 3. تثبيت لغة Node.js (الإصدار الاستقرائي 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. التثبيت العالمي لمدير العمليات PM2
sudo npm install -g pm2
```

---

## 📂 3. الخطوة الثانية: سحب المشروع من GitHub إلى السيرفر (Cloning Code)

```bash
# الانتقال لمجلد التطبيقات العام
cd /var/www

# سحب الكود المصدري للمشروع من المستودع الرسمي
sudo git clone https://github.com/YousifHamid/lawyer-app.git

# تغيير صلاحيات المجلد
sudo chown -R $USER:$USER /var/www/lawyer-app

# الانتقال لمجلد الباك إند
cd /var/www/lawyer-app/lawyer-app/backend

# تثبيت جميع المكتبيات والاعتمادات البرمجية
npm install --production
```

---

## ⚙️ 4. الخطوة الثالثة: ضبط متغيرات البيئة والتجهيز الأول (Environment & Seed)

قم بإنشاء ملف `.env` داخل مجلد `backend`:

```bash
nano .env
```

ضع البيانات التالية داخل الملف:

```env
PORT=4000
NODE_ENV=production
JWT_SECRET=lawyer_app_secure_secret_key_2026_sudan_prod
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

حفظ وغلق الملف (`Ctrl+O` ثم `Enter` ثم `Ctrl+X`).

ثم قم بتشغيل سكربت الاعتماد الأولي وحسابات الاختبار:

```bash
# تشغيل سكربت إنشـاء الجداول والمستخدمين الأوليين
node seed.js
```

---

## 🚀 5. الخطوة الرابعة: تشغيل خادم الباك إند بواسطة PM2 (Process Manager)

لضمان عمل الباك إند 24/7 دون انقطاع وإعادة تشغيله تلقائياً في حال إعادة تشغيل السيرفر:

```bash
# تشغيل الخادم باسم lawyer-backend
pm2 start src/server.js --name "lawyer-backend"

# حفظ قائمة العمليات الحالية
pm2 save

# ربط PM2 للبدء التلقائي مع إقلاع السيرفر
pm2 startup
```

---

## 🌐 6. الخطوة الخامسة: إعداد خادم Nginx والتوجيه التلقائي (Reverse Proxy)

قم بإنشاء ملف تكوين جديد لـ Nginx:

```bash
sudo nano /etc/nginx/sites-available/lawyer-app
```

ضع التكوين التالي داخل الملف (مع استبدال `api.lawyer-app.sd` بدومين سيرفرك):

```nginx
server {
    listen 80;
    server_name api.lawyer-app.sd;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # زيادة حد رفع الصور والمستندات (حتى 50 ميجابايت)
    client_max_body_size 50M;
}
```

قم بتفعيل التكوين واختبار Nginx وإعادة تشغيله:

```bash
# تفعيل التكوين
sudo ln -s /etc/nginx/sites-available/lawyer-app /etc/nginx/sites-enabled/

# اختبار سلامة التكوين
sudo nginx -t

# إعادة تشغيل خادم Nginx
sudo systemctl restart nginx
```

---

## 🔒 7. الخطوة السادسة: تفعيل شهادة الأمان المشفرة SSL (HTTPS)

للحصول على شهادة SSL مجانية ومعتمدة من Let's Encrypt:

```bash
sudo certbot --nginx -d api.lawyer-app.sd
```

اختر الخيار `2` للتوجيه التلقائي لكافة الحركة لـ `HTTPS`.

---

## 📱 8. الخطوة السابعة: ربط تطبيق الموبايل بالرابط الإنتاجي للسيرفر

في كود تطبيق الموبايل الخاص بك ([mobile/src/api/client.js](file:///d:/LAWYER%20APP/lawyer-app/lawyer-app/mobile/src/api/client.js)):

قم بتحديث الرابط ليكون دومين سيرفرك الإنتاجي:

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// رابط خادم السيرفر الإنتاجي المحمي
const BASE_URL = 'https://api.lawyer-app.sd/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 🎯 9. روابط الخادم الجاهزة بعد الرفع (Live Server Endpoints)

* **رابط الباك إند والـ API الرئيسي:** `https://api.lawyer-app.sd/api`
* **رابط لوحة التحكم الإدارية للمالك (Web Admin):** `https://api.lawyer-app.sd/admin`
* **رابط سياسة الخصوصية للمتاجر (Privacy Policy):** `https://api.lawyer-app.sd/privacy`
* **رابط شروط الاستخدام (Terms of Service):** `https://api.lawyer-app.sd/terms`
