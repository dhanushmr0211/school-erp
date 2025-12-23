const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ✅ IMPORT ALL ROUTES
const adminRoutes = require('./routes/admin.routes');
const facultyRoutes = require('./routes/faculty.routes');
const studentRoutes = require('./routes/student.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: '*', // TEMP: allow all during development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-academic-year'],
  })
);

app.use(express.json());

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ MOUNT ROUTES
app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
app.use('/student', studentRoutes);
app.use('/reports', reportsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
