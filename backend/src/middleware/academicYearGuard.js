const academicYearGuard = (req, res, next) => {
    const academicYearId = req.headers['x-academic-year'];

    if (!academicYearId) {
        return res.status(400).json({ error: 'Academic Year ID is required' });
    }

    req.academicYearId = academicYearId;
    next();
};

module.exports = academicYearGuard;
