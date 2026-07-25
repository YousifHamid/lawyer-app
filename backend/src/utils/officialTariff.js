/**
 * ميثاق شرف وأمانة رسوم التوثيقات 2026م - محامو السودان الموثقين
 * جدول الحد الأدنى الرسمي لأسعار الخدمات والتوثيقات القانونية (بالجنيه والدولار)
 */

const OFFICIAL_TARIFF_2026 = [
  {
    id: 1,
    category: 'العقارات',
    title: 'عقود بيع العقارات المسجلة (شاملة العقد + أورنيك 3أ + العريضة)',
    description: 'للعقارات أقل من مليار جنيه، وما زاد عن ذلك الرسم النسبي 1% من القيمة',
    minPriceSDG: 1000000,
    priceUSD: null,
  },
  {
    id: 2,
    category: 'العقارات',
    title: 'عقود البيع والتنازل للعقارات الحيازة',
    description: 'توثيق عقود البيع والتنازل عن العقارات السكنية أو الحيازة',
    minPriceSDG: 750000,
    priceUSD: null,
  },
  {
    id: 3,
    category: 'العقارات والتوكيلات',
    title: 'توكيل التصرفات في العقارات',
    description: 'توثيق واعتتماد التوكيل الرسمي للتصرف بالبيع والشراء في العقارات',
    minPriceSDG: 400000,
    priceUSD: null,
  },
  {
    id: 4,
    category: 'التوكيلات والإقرارات',
    title: 'توكيل إجرائي والإقرارات المشفوعة باليمين',
    description: 'توثيق التوكيلات القضائية والإجرائية والإقرارات المشفوعة باليمين الحاسمة',
    minPriceSDG: 300000,
    priceUSD: null,
  },
  {
    id: 5,
    category: 'التركات والتنازلات',
    title: 'توكيل التصرف في التركات وعقود التخارج والتنازل عن الحصة',
    description: 'إجراء وتوثيق التخارج بين الورثة والتنازل الرسمي عن الأنصبة الشرعية',
    minPriceSDG: 500000,
    priceUSD: null,
  },
  {
    id: 6,
    category: 'المركبات والسيارات',
    title: 'عقود بيع المركبات والسيارات',
    description: 'تحرير وتوثيق عقود المبايعات والتنازل للمركبات والسيارات',
    minPriceSDG: 400000,
    priceUSD: null,
  },
  {
    id: 7,
    category: 'المركبات والسيارات',
    title: 'توكيل شامل بالتصرف في مركبة',
    description: 'توثيق التوكيل الشامل لإدارة وتأجير وبيع السيارات والمركبات',
    minPriceSDG: 300000,
    priceUSD: 300,
  },
  {
    id: 8,
    category: 'الركشات والمواتر',
    title: 'عقد بيع ركشة أو موتر',
    description: 'تحرير وتوثيق مبايعة ركشة أو دراجة نارية (موتر)',
    minPriceSDG: 350000,
    priceUSD: null,
  },
  {
    id: 9,
    category: 'الركشات والمواتر',
    title: 'توكيل شامل بالتصرف في ركشة أو موتر',
    description: 'توثيق التوكيل الشامل بالتصرف في الركشات والدراجات النارية',
    minPriceSDG: 250000,
    priceUSD: null,
  },
  {
    id: 10,
    category: 'السفارات والترجمة',
    title: 'الإقرارات للسفارات باللغة الإنجليزية',
    description: 'صياغة وتوثيق الإقرارات الرسمية الموجهة للسفارات باللغة الإنجليزية',
    minPriceSDG: 300000,
    priceUSD: null,
  },
  {
    id: 11,
    category: 'العقارات',
    title: 'عقود اتفاق قسمة الإفراز',
    description: 'توثيق عقود القسمة والإفراز للعقارات والأراضي المشتركة',
    minPriceSDG: 500000,
    priceUSD: null,
  },
  {
    id: 12,
    category: 'الشركات وأسماء الأعمال',
    title: 'توثيق كتيبات الشركات + أورنيك ش1 وش2',
    description: 'توثيق عقود تأسيس الشركات والنظام الأساسي واستخراج النماذج الرسمية',
    minPriceSDG: 500000,
    priceUSD: 1000,
  },
  {
    id: 13,
    category: 'الشركات وأسماء الأعمال',
    title: 'توثيق أورنيك اسم عمل أو الشراكة',
    description: 'توثيق أورنيك استخراج اسم العمل وعقود الشراكات التجارية',
    minPriceSDG: 300000,
    priceUSD: 300,
  },
  {
    id: 14,
    category: 'الاتصالات والإنذارات',
    title: 'الإقرارات الخاصة بشرايح الهاتف المحمول والإنذارات القانونية',
    description: 'توثيق التنازلات عن شرايح الاتصالات وصياغة الإنذارات القانونية الرسمية',
    minPriceSDG: 250000,
    priceUSD: null,
  },
  {
    id: 15,
    category: 'الإيجارات',
    title: 'عقود الإيجار (أقل من مليار جنيه)',
    description: 'للعقود أقل من مليار جنيه (العقد نسختين)، وما زاد تطبق نسبة 10% من قيمة الأجرة',
    minPriceSDG: 300000,
    priceUSD: 300,
  },
  {
    id: 16,
    category: 'الشراكات التجاري',
    title: 'عقود الشراكة (أقل من 10 مليار جنيه)',
    description: 'للعقود أقل من 10 مليار (العقد نسختين)، وما زاد تطبق نسبة 1% من قيمة الشراكة',
    minPriceSDG: 400000,
    priceUSD: 300,
  },
  {
    id: 17,
    category: 'عقود العمل',
    title: 'عقود العمل الفردي',
    description: 'صياغة وتوثيق الاتفاقيات وعقود العمل الفردي للمؤسسات والأفراد',
    minPriceSDG: 300000,
    priceUSD: 300,
  },
  {
    id: 18,
    category: 'توثيقات عامة',
    title: 'عقود وتوثيقات أخرى والتصديق على المستندات',
    description: 'التصديق القانوني على المستندات والوثائق المتنوعة',
    minPriceSDG: 300000,
    priceUSD: 300,
  },
];

function getEstimatedPrice(titleText = '') {
  if (!titleText) return 300000;
  const match = OFFICIAL_TARIFF_2026.find(item =>
    titleText.toLowerCase().includes(item.title.toLowerCase()) ||
    item.title.toLowerCase().includes(titleText.toLowerCase())
  );
  return match ? match.minPriceSDG : 300000;
}

module.exports = {
  OFFICIAL_TARIFF_2026,
  getEstimatedPrice,
};
