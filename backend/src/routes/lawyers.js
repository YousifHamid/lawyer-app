const express = require('express');
const { LawyerProfile, User, Service, Region } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Op } = require('sequelize');

const router = express.Router();

// قائمة المحامين (فلترة بالمنطقة أو التخصص)
router.get('/', async (req, res) => {
  try {
    const { region_id, specialty, searchQuery } = req.query;
    const where = { is_verified: true };
    if (region_id) where.region_id = region_id;
    if (specialty) where.specialty = specialty;

    const userWhere = {};
    if (searchQuery) {
      userWhere.name = { [Op.like]: `%${searchQuery}%` };
    }

    const lawyers = await LawyerProfile.findAll({
      where,
      include: [
        { model: User, where: Object.keys(userWhere).length > 0 ? userWhere : undefined, attributes: ['id', 'name', 'avatar', 'phone'] },
        { model: Region },
      ],
    });
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// بروفايل محامي واحد + خدماته
router.get('/:id', async (req, res) => {
  try {
    const lawyer = await LawyerProfile.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'avatar', 'phone'] },
        { model: Region },
        { model: Service, where: { is_active: true }, required: false },
      ],
    });
    if (!lawyer) return res.status(404).json({ error: 'المحامي غير موجود' });
    res.json(lawyer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تعديل بروفايل المحامي ورفع الصورة الشخصية
router.put('/me', auth, requireRole('lawyer'), upload.single('avatar'), async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'البروفايل غير موجود' });

    const { specialty, whatsapp, bio, region_id, lat, lng } = req.body;
    const updateData = {};
    if (specialty !== undefined) updateData.specialty = specialty;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (bio !== undefined) updateData.bio = bio;
    if (region_id !== undefined) updateData.region_id = region_id;
    if (lat !== undefined) updateData.lat = lat;
    if (lng !== undefined) updateData.lng = lng;

    if (req.file) {
      const avatarUrl = `/uploads/${req.file.filename}`;
      updateData.avatar = avatarUrl;
      const user = await User.findByPk(req.user.id);
      if (user) {
        user.avatar = avatarUrl;
        await user.save();
      }
    }

    await profile.update(updateData);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// رفع صورة البروفايل الشخصية منفصلة
router.post('/me/avatar', auth, requireRole('lawyer'), upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const profile = await LawyerProfile.findOne({ where: { user_id: req.user.id } });
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    if (user) {
      user.avatar = avatarUrl;
      await user.save();
    }
    if (profile) {
      profile.avatar = avatarUrl;
      await profile.save();
    }

    res.json({ avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// رفع مستند الترخيص
router.post('/me/document', auth, requireRole('lawyer'), upload.single('document'), async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ where: { user_id: req.user.id } });
    profile.license_document = `/uploads/${req.file.filename}`;
    await profile.save();
    res.json({ license_document: profile.license_document });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
