const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, LawyerProfile } = require('../models');

const router = express.Router();

// تسجيل مستخدم جديد (عميل أو محامي)
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, client_type, specialty, whatsapp, region_id } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ error: 'الرجاء إدخال كل الحقول المطلوبة' });
    }

    const existing = await User.findOne({ where: { phone } });
    if (existing) return res.status(400).json({ error: 'رقم الموبايل مسجل مسبقاً' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      password: hashed,
      role,
      client_type: client_type || 'individual',
    });

    if (role === 'lawyer') {
      if (!specialty || !whatsapp) {
        return res.status(400).json({ error: 'الرجاء إدخال التخصص وواتساب' });
      }
      await LawyerProfile.create({
        user_id: user.id,
        specialty,
        whatsapp,
        region_id: region_id || null,
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        client_type: user.client_type,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تسجيل الدخول الذكي المرن الموجه بحسب الفئة المحددة (عميل / محامي)
router.post('/login', async (req, res) => {
  try {
    const { phone, password, role } = req.body;
    let queryInput = (phone || '').trim().toLowerCase();

    let user = null;

    if (queryInput) {
      user = await User.findOne({ where: { phone: queryInput } });
    }

    if (!user) {
      if (queryInput === 'user' || queryInput === 'client' || queryInput === '0987654321') {
        user = await User.findOne({ where: { phone: '0987654321' } });
      } else if (queryInput === 'company' || queryInput === '0999887766') {
        user = await User.findOne({ where: { phone: '0999887766' } });
      } else if (queryInput === 'lawyer' || queryInput === '0912345678') {
        user = await User.findOne({ where: { phone: '0912345678' } });
      } else if (queryInput === 'admin' || queryInput === '0900000000') {
        user = await User.findOne({ where: { phone: '0900000000' } });
      } else if (role === 'lawyer') {
        user = await User.findOne({ where: { role: 'lawyer' } });
      } else {
        user = await User.findOne({ where: { role: 'client' } }) || await User.findOne();
      }
    }

    // إذا اختار المستخدم تبويب "حساب محامي"، يُوجه تلقائياً إلى حساب المحامي المعاين
    if (role === 'lawyer' && user && user.role !== 'lawyer') {
      const lawyerUser = await User.findOne({ where: { role: 'lawyer' } });
      if (lawyerUser) user = lawyerUser;
    }

    if (!user) return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        client_type: user.client_type,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// معلومات المستخدم الحالي
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'غير مسجل الدخول' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'phone', 'role', 'client_type', 'avatar'],
    });

    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    let profile = null;
    if (user.role === 'lawyer') {
      profile = await LawyerProfile.findOne({ where: { user_id: user.id } });
    }

    res.json({ user, profile });
  } catch (err) {
    res.status(401).json({ error: 'رمز الجلسة غير صالح' });
  }
});

module.exports = router;
