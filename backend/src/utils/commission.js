function calculateCommission(price) {
  // نسبة عمولة متوازنة ومحفزة للمحامين (5% افتراضياً)
  const percent = Number(process.env.COMMISSION_PERCENT || 5);
  return Number(((price * percent) / 100).toFixed(2));
}

module.exports = { calculateCommission };
