
export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure req.user exists (set by protect middleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    // Check if user's role is inside the allowed roles array
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized to access this route.`
      });
    }

    next();
  };
};