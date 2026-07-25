const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../../banner_store.json');

const DEFAULT_DATA = {
  owner_ad_image: '/uploads/owner_ad_banner.png',
  client_banners: [
    {
      id: 'c1',
      title: '📜 لائحة رسوم التوثيقات الرسمية 2026م',
      subtitle: 'نوّثق عقودك وشركاتك وسياراتك بحسب التعريفة المعتمدة أصولاً',
      badge: 'إعلان رسمي',
    },
    {
      id: 'c2',
      title: '⚖️ نخبة المحامين والموثقين بالسودان',
      subtitle: 'تواصل مباشر واستشارات قانونية موثوقة لحماية حقوقك',
      badge: 'خدمة متميزة',
    },
    {
      id: 'c3',
      title: '🏢 خدمات خاصة للمؤسسات والشركات',
      subtitle: 'صياغة كتيبات التأسيس والنظام الأساسي واعتماد مسجل الشركات',
      badge: 'قطاع الأعمال',
    },
  ],
  lawyer_banners: [
    {
      id: 'l1',
      title: '⚖️ ميثاق رسوم التوثيقات 2026م',
      subtitle: 'التزام تام بالحد الأدنى لرسوم التوثيق الرسمية وحماية المهنة',
      badge: 'تنبيه مهني',
    },
    {
      id: 'l2',
      title: '🌐 استقبال طلبات الشركات والأفراد',
      subtitle: 'قدّم عروض تنفيذ مخصصة للطلبات العامة المتاحة بالتطبيق فوراً',
      badge: 'فرص عمل',
    },
    {
      id: 'l3',
      title: '🛡️ عمولة منخفضة ومحفزة (5%)',
      subtitle: 'احصل على صافي مستحقاتك وأتعابك بكل سهولة وشفافية',
      badge: 'ميزة المنصة',
    },
  ],
};

function getBannerStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading banner store:', err);
  }
  return DEFAULT_DATA;
}

function saveBannerStore(data) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving banner store:', err);
  }
}

module.exports = { getBannerStore, saveBannerStore };
