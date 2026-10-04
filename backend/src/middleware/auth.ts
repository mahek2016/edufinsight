import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edufinsight_default_jwt_secret_dev_2026';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'STUDENT' | 'COUNSELLOR';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function generateToken(payload: AuthenticatedUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. No Bearer token provided in Authorization header.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: 'Invalid or expired authentication token. Please log in again.'
    });
  }
}

export function requireRole(...allowedRoles: Array<'STUDENT' | 'COUNSELLOR'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Endpoint requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}
