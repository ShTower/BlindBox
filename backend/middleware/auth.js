function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.status(400).json({ error: 'Already authenticated' });
    }
    next();
}

module.exports = { checkAuthenticated, checkNotAuthenticated }; 