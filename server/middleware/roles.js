
// This middleware accepts an array of allowed roles
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // req.user comes from the 'authorization' middleware we already built
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access Denied: Insufficient Permissions" });
        }
        next();
    };
};

module.exports = checkRole;