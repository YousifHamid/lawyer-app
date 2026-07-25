const express = require('express');
const { User, LawyerProfile, Service, ServiceRequest, Region } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getBannerStore, saveBannerStore } = require('../utils/bannerStore');

const router = express.Router();

// 0. الحصول على كافة البنرات وإعلان المالك (متاح للجميع داخل التطبيق)
router.get('/banners', (req, res) => {
  try {
    const data = getBannerStore();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. إحصائيات الإدارة العامة للتطبيق
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalClients = await User.count({ where: { role: 'client' } });
    const totalLawyers = await User.count({ where: { role: 'lawyer' } });
    const pendingLawyers = await LawyerProfile.count({ where: { is_verified: false } });
    const totalServices = await Service.count();
    const totalRequests = await ServiceRequest.count();

    res.json({
      totalUsers,
      totalClients,
      totalLawyers,
      pendingLawyers,
      totalServices,
      totalRequests,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. إدارة جميع المحامين واعتمادهم
router.get('/lawyers', auth, requireRole('admin'), async (req, res) => {
  try {
    const lawyers = await LawyerProfile.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'phone', 'avatar'] }, { model: Region }],
      order: [['createdAt', 'DESC']],
    });
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// اعتماد أو إلغاء اعتماد حساب محامي
router.put('/lawyers/:id/verify', auth, requireRole('admin'), async (req, res) => {
  try {
    const { is_verified } = req.body;
    const profile = await LawyerProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ error: 'حساب المحامي غير موجود' });

    profile.is_verified = is_verified !== undefined ? is_verified : true;
    await profile.save();

    res.json({ message: 'تم تحديث حالة اعتماد المحامي بنجاح', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. إدارة جميع العملاء (أفراد / شركات / جهات حكومية)
router.get('/clients', auth, requireRole('admin'), async (req, res) => {
  try {
    const clients = await User.findAll({
      where: { role: 'client' },
      attributes: ['id', 'name', 'phone', 'client_type', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. إدارة ومراقبة جميع طلبات التطبيق
router.get('/requests', auth, requireRole('admin'), async (req, res) => {
  try {
    const requests = await ServiceRequest.findAll({
      include: [
        Service,
        { model: User, as: 'client', attributes: ['id', 'name', 'phone', 'client_type'] },
        { model: LawyerProfile, include: [{ model: User, attributes: ['name', 'phone'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. تعديل وتحديث صورة إعلان المالك ونصوص البنرات فوق من الأدمن داشبورد
router.put('/banners', auth, requireRole('admin'), upload.single('owner_ad'), async (req, res) => {
  try {
    const currentStore = getBannerStore();

    if (req.file) {
      currentStore.owner_ad_image = `/uploads/${req.file.filename}`;
    }

    if (req.body.client_banners) {
      try {
        currentStore.client_banners = typeof req.body.client_banners === 'string' ? JSON.parse(req.body.client_banners) : req.body.client_banners;
      } catch (e) {}
    }

    if (req.body.lawyer_banners) {
      try {
        currentStore.lawyer_banners = typeof req.body.lawyer_banners === 'string' ? JSON.parse(req.body.lawyer_banners) : req.body.lawyer_banners;
      } catch (e) {}
    }

    saveBannerStore(currentStore);
    res.json({ message: 'تم تحديث صورة إعلان المالك والبنرات فوق بنجاح', data: currentStore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
