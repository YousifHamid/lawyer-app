const express = require('express');
const { Service, LawyerProfile, User } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// جميع الخدمات المتاحة للعملاء
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      include: [{ model: LawyerProfile, include: [User] }],
    });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة خدمة جديدة (محامي فقط)
router.post('/', auth, requireRole('lawyer'), upload.single('image'), async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'البروفايل غير موجود' });

    const { title, description, price } = req.body;
    const service = await Service.create({
      lawyer_id: profile.id,
      title,
      description,
      price,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تعديل خدمة مع رفع مستند/صورة
router.put('/:id', auth, requireRole('lawyer'), upload.single('image'), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'الخدمة غير موجودة' });

    const { title, description, price, is_active } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await service.update(updateData);
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف خدمة
router.delete('/:id', auth, requireRole('lawyer'), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'الخدمة غير موجودة' });
    await service.destroy();
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// خدمات محامي معين (خاصة بلوحته)
router.get('/mine', auth, requireRole('lawyer'), async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ where: { user_id: req.user.id } });
    const services = await Service.findAll({ where: { lawyer_id: profile.id } });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
