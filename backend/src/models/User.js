const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('client', 'lawyer', 'admin'), allowNull: false, defaultValue: 'client' },
  client_type: { type: DataTypes.ENUM('individual', 'company', 'government'), defaultValue: 'individual' },
  avatar: { type: DataTypes.STRING, allowNull: true },
});

module.exports = User;
