require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Region, User, LawyerProfile, Service } = require('./src/models');
const { OFFICIAL_TARIFF_2026 } = require('./src/utils/officialTariff');

const regions = ['الخرطوم', 'أم درمان', 'بحري', 'بورتسودان', 'مدني', 'كسلا', 'نيالا', 'الأبيض'];

async function seed() {
  await sequelize.sync();

  // Safely add missing columns to SQLite database if needed
  const qi = sequelize.getQueryInterface();
  try {
    await qi.addColumn('Users', 'client_type', {
      type: sequelize.Sequelize.STRING,
      defaultValue: 'individual',
    });
  } catch (e) {}

  try {
    await qi.addColumn('LawyerProfiles', 'avatar', {
      type: sequelize.Sequelize.STRING,
      allowNull: true,
    });
  } catch (e) {}

  try {
    await qi.addColumn('ServiceRequests', 'base_official_fee', {
      type: sequelize.Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  } catch (e) {}

  // 1. Seed Regions
  const createdRegions = [];
  for (const name of regions) {
    const [reg] = await Region.findOrCreate({ where: { name } });
    createdRegions.push(reg);
  }

  const hashedPassword = await bcrypt.hash('123/123', 10);

  // 2. Seed Individual Client User
  const [clientUser] = await User.findOrCreate({
    where: { phone: '0987654321' },
    defaults: {
      name: 'محمد السعيد',
      phone: '0987654321',
      password: hashedPassword,
      role: 'client',
      client_type: 'individual',
    },
  });
  await clientUser.update({ password: hashedPassword });

  // 3. Seed Company Client User
  const [companyUser] = await User.findOrCreate({
    where: { phone: '0999887766' },
    defaults: {
      name: 'شركة النيل للخدمات التجارية',
      phone: '0999887766',
      password: hashedPassword,
      role: 'client',
      client_type: 'company',
    },
  });
  await companyUser.update({ password: hashedPassword });

  // 4. Seed Lawyer User
  const [lawyerUser] = await User.findOrCreate({
    where: { phone: '0912345678' },
    defaults: {
      name: 'أستاذ أحمد علي',
      phone: '0912345678',
      password: hashedPassword,
      role: 'lawyer',
    },
  });
  await lawyerUser.update({ password: hashedPassword });

  // Seed Lawyer Profile
  const [lawyerProfile] = await LawyerProfile.findOrCreate({
    where: { user_id: lawyerUser.id },
    defaults: {
      user_id: lawyerUser.id,
      specialty: 'قانون تجاري وجنائي وتوثيقات',
      whatsapp: '249912345678',
      region_id: createdRegions[0].id,
      is_verified: true,
      bio: 'محامي موثق ومستشار قانوني معتمد بخبرة تزيد عن 10 سنوات في صياغة وتوثيق العقود والاتفاقيات التجارية.',
    },
  });

  // 5. Seed Admin User
  const [adminUser] = await User.findOrCreate({
    where: { phone: '0900000000' },
    defaults: {
      name: 'الإدارة العامة للتطبيق',
      phone: '0900000000',
      password: hashedPassword,
      role: 'admin',
    },
  });
  await adminUser.update({ password: hashedPassword });

  // Seed Services based on Official 2026 Tariff Schedule
  for (const item of OFFICIAL_TARIFF_2026.slice(0, 8)) {
    await Service.findOrCreate({
      where: { title: item.title },
      defaults: {
        lawyer_id: lawyerProfile.id,
        title: item.title,
        description: item.description,
        price: item.minPriceSDG,
      },
    });
  }

  console.log('✅ تم توحيد كلمة المرور لجميع الحسابات إلى: 123/123 (أو 123) بنجاح');
  process.exit(0);
}

seed();
