import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token || req.headers?.authorization?.split(' ')[1];
  if (!token) return next(errorHandler(401, "You need to login"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(403, "Token is not valid"));
    }
    req.user = user;
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) return next(errorHandler(401, "You need to login"));
  if (!req.user.isAdmin) return next(errorHandler(403, "Admin access required"));
  next();
};

