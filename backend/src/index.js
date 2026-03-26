const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ✅ IMPORT ALL ROUTES
const adminRoutes = require('./routes/admin.routes');
const facultyRoutes = require('./routes/faculty.routes');
const studentRoutes = require('./routes/student.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();
const port = process.env.PORT || 5000;

// Trust the reverse proxy (Render) so rate limiting uses the correct client IP
app.set('trust proxy', 1);

// 1. CORS - MUST BE FIRST
app.use(
  cors({
    origin: [
      'https://anikethanainfoedu.vercel.app', 
      'https://www.anikethana.in', 
      'https://anikethana.in', 
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-academic-year'],
    credentials: true,
    optionsSuccessStatus: 204
  })
);

app.use(express.json());

// 2. RATE LIMITING
// Increased limit for ERP dashboards (1000 requests per 15 mins)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, 
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Strict limiter for student login (prevents brute force on DOB/admission number)
const studentVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ MOUNT ROUTES
app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
app.use('/student/verify', studentVerifyLimiter); // Strict limit on public login
app.use('/student', studentRoutes);
app.use('/reports', reportsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Server v2.0 - Fees Fix Applied");
});
