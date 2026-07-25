const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LawyerProfile = sequelize.define('LawyerProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  specialty: { type: DataTypes.STRING, allowNull: false },
  whatsapp: { type: DataTypes.STRING, allowNull: false },
  avatar: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  lat: { type: DataTypes.FLOAT, allowNull: true },
  lng: { type: DataTypes.FLOAT, allowNull: true },
  license_document: { type: DataTypes.STRING, allowNull: true },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  rating_avg: { type: DataTypes.FLOAT, defaultValue: 0 },
});

module.exports = LawyerProfile;
