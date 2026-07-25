const sequelize = require('../config/database');
const User = require('./User');
const Region = require('./Region');
const LawyerProfile = require('./LawyerProfile');
const Service = require('./Service');
const ServiceRequest = require('./ServiceRequest');

// User (lawyer) <-> LawyerProfile : 1-1
User.hasOne(LawyerProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
LawyerProfile.belongsTo(User, { foreignKey: 'user_id' });

// Region -> LawyerProfile : 1-n
Region.hasMany(LawyerProfile, { foreignKey: 'region_id' });
LawyerProfile.belongsTo(Region, { foreignKey: 'region_id' });

// LawyerProfile -> Service : 1-n
LawyerProfile.hasMany(Service, { foreignKey: 'lawyer_id', onDelete: 'CASCADE' });
Service.belongsTo(LawyerProfile, { foreignKey: 'lawyer_id' });

// Requests
User.hasMany(ServiceRequest, { foreignKey: 'client_id' });
ServiceRequest.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

LawyerProfile.hasMany(ServiceRequest, { foreignKey: 'lawyer_id' });
ServiceRequest.belongsTo(LawyerProfile, { foreignKey: 'lawyer_id' });

Service.hasMany(ServiceRequest, { foreignKey: 'service_id' });
ServiceRequest.belongsTo(Service, { foreignKey: 'service_id' });

module.exports = {
  sequelize,
  User,
  Region,
  LawyerProfile,
  Service,
  ServiceRequest,
};
