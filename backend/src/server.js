require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const lawyerRoutes = require('./routes/lawyers');
const serviceRoutes = require('./routes/services');
const requestRoutes = require('./routes/requests');
const regionRoutes = require('./routes/regions');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Privacy Policy & Terms of Service Routes for App Stores
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, '../public/privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, '../public/terms.html')));

app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/dashboard', (req, res) => res.redirect('/admin'));
app.get('/', (req, res) => res.json({
  status: 'ok',
  message: 'Lawyer App API 2026',
  adminUrl: 'http://localhost:4000/admin',
  privacyUrl: 'http://localhost:4000/privacy',
  termsUrl: 'http://localhost:4000/terms'
}));

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} - Admin: http://localhost:${PORT}/admin | Privacy: http://localhost:${PORT}/privacy`));
});
