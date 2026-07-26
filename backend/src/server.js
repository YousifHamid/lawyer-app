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

app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/dashboard', (req, res) => res.redirect('/admin'));
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Lawyer App API 2026', adminUrl: 'http://localhost:4000/admin' }));

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} - Admin Web Dashboard: http://localhost:${PORT}/admin`));
});
