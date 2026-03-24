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

app.use(
  cors({
    origin: ['https://anikethainfoedu.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-academic-year'],
  })
);

// General rate limiter — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for student login (prevents brute force on DOB/admission number)
const studentVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

app.use(express.json());

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
