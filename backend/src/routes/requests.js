const express = require('express');
const { ServiceRequest, Service, LawyerProfile, User } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const { calculateCommission } = require('../utils/commission');
const { getEstimatedPrice, OFFICIAL_TARIFF_2026 } = require('../utils/officialTariff');
const { Op } = require('sequelize');

const router = express.Router();

// 0. جدول رسوم التوثيقات والأسعار الرسمية الثابتة 2026م
router.get('/tariff', async (req, res) => {
  res.json(OFFICIAL_TARIFF_2026);
});

// 1. إنشاء طلب جديد وتحديد رسوم التوثيق الرسمية الثابتة تلقائياً
router.post('/', auth, requireRole('client'), async (req, res) => {
  try {
    const { service_id, lawyer_id, title, description, target_type } = req.body;
    let targetLawyerId = target_type === 'specific' ? lawyer_id : (lawyer_id || null);
    let targetServiceId = service_id || null;
    let officialFee = getEstimatedPrice(title || '');

    if (!targetServiceId) {
      const [customService] = await Service.findOrCreate({
        where: { title: title || 'طلب استشارة قانونية جديدة' },
        defaults: {
          title: title || 'طلب استشارة قانونية جديدة',
          description: description || 'طلب خدمة مخصصة من العميل',
          price: officialFee,
        },
      });
      targetServiceId = customService.id;
    } else {
      const service = await Service.findByPk(targetServiceId);
      if (service) officialFee = service.price;
    }

    const commission = calculateCommission(officialFee);

    const request = await ServiceRequest.create({
      client_id: req.user.id,
      lawyer_id: targetLawyerId,
      service_id: targetServiceId,
      price: officialFee,
      base_official_fee: officialFee,
      commission_amount: commission,
      current_step_status: 'قيد المراجعة وإعداد الملف',
      current_location: 'مكتب المحامي الموثق',
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. طلبات العميل
router.get('/mine', auth, requireRole('client'), async (req, res) => {
  try {
    const requests = await ServiceRequest.findAll({
      where: { client_id: req.user.id },
      include: [Service, { model: LawyerProfile, include: [User] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. الطلبات الواردة للمحامي
router.get('/incoming', auth, requireRole('lawyer'), async (req, res) => {
  try {
    const profile = await LawyerProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'ملف المحامي غير موجود' });

    const requests = await ServiceRequest.findAll({
      where: {
        [Op.or]: [
          { lawyer_id: profile.id },
          { lawyer_id: null, status: 'pending' },
        ],
      },
      include: [Service, { model: User, as: 'client', attributes: ['id', 'name', 'phone'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. المحامي يقدّم عرض أتعاب التنفيذ (أتعاب المحامي)
router.put('/:id/offer', auth, requireRole('lawyer'), async (req, res) => {
  try {
    const { offered_price, offer_notes } = req.body;
    const profile = await LawyerProfile.findOne({ where: { user_id: req.user.id } });
    const request = await ServiceRequest.findByPk(req.params.id);

    if (!request) return res.status(404).json({ error: 'الطلب غير موجود' });

    const lawyerFee = Number(offered_price || 0);
    const baseFee = Number(request.base_official_fee || request.price || 0);
    const totalFee = baseFee + lawyerFee;

    request.lawyer_id = profile.id;
    request.status = 'offered';
    request.offered_price = lawyerFee;
    request.price = totalFee;
    request.offer_notes = offer_notes || 'أتعاب المحامي للتنفيذ';
    request.commission_amount = calculateCommission(totalFee);
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. العميل يقبل أو يرفض عرض المحامي
router.put('/:id/decision', auth, requireRole('client'), async (req, res) => {
  try {
    const { decision } = req.body;
    const request = await ServiceRequest.findByPk(req.params.id);

    if (!request) return res.status(404).json({ error: 'الطلب غير موجود' });
    if (request.client_id !== req.user.id) return res.status(403).json({ error: 'غير مصرح بالوصول لهذا الطلب' });

    request.status = decision === 'accepted' ? 'accepted' : 'rejected';
    if (decision === 'accepted') {
      request.current_step_status = 'تم قبول العرض وبدء تنفيذ المعاملة رسمياً';
    }
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. إلغاء وحذف الطلب
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await ServiceRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'الطلب غير موجود' });

    if (req.user.role === 'client' && request.client_id !== req.user.id) {
      return res.status(403).json({ error: 'غير مصرح بحذف هذا الطلب' });
    }

    await request.destroy();
    res.json({ message: 'تم إلغاء وحذف الطلب بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. المحامي يحدّث حالة الإجراء والموقع والمتطلبات الموجهة للعميل
router.put('/:id/progress', auth, requireRole('lawyer'), async (req, res) => {
  try {
    const { current_step_status, current_location, lawyer_notes, status } = req.body;
    const request = await ServiceRequest.findByPk(req.params.id);

    if (!request) return res.status(404).json({ error: 'الطلب غير موجود' });

    if (current_step_status !== undefined) request.current_step_status = current_step_status;
    if (current_location !== undefined) request.current_location = current_location;
    if (lawyer_notes !== undefined) request.lawyer_notes = lawyer_notes;
    if (status !== undefined) request.status = status;

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
