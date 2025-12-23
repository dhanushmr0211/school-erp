const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin.routes');

dotenv.config();

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

app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
app.use('/student', studentRoutes);
app.use('/reports', reportsRoutes);


app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
