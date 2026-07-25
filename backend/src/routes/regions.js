const express = require('express');
const { Region } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const regions = await Region.findAll();
  res.json(regions);
});

module.exports = router;
