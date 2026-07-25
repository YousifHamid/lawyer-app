const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceRequest = sequelize.define('ServiceRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: {
    type: DataTypes.ENUM('pending', 'offered', 'accepted', 'rejected', 'completed'),
    defaultValue: 'pending',
  },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  base_official_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  commission_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  offered_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  offer_notes: { type: DataTypes.TEXT, allowNull: true },
  current_step_status: { type: DataTypes.STRING, allowNull: true, defaultValue: 'قيد المراجعة والبدء في الإجراءات' },
  current_location: { type: DataTypes.STRING, allowNull: true, defaultValue: 'مكتب المحامي الموثق' },
  lawyer_notes: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = ServiceRequest;
