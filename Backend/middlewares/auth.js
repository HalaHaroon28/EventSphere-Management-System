import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        _id: decoded.user_id || decoded._id,
        user_id: decoded.user_id || decoded._id,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
      };

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
          _id: decoded.user_id || decoded._id,
          user_id: decoded.user_id || decoded._id,
          role: decoded.role,
          name: decoded.name,
          email: decoded.email,
        };
      }
    } catch (error) {
      // Gracefully continue without user if token is invalid
    }
  }

  next();
};