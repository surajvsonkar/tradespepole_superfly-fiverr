import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userType?: 'homeowner' | 'tradesperson';
  userEmail?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      userType: 'homeowner' | 'tradesperson';
      email?: string;
    };
    
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
};

// Alias for consistency
export const authMiddleware = authenticateToken;


export const requireTradesperson = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.userType !== 'tradesperson') {
    res.status(403).json({ error: 'This action requires a tradesperson account' });
    return;
  }
  next();
};

export const requireHomeowner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.userType !== 'homeowner') {
    res.status(403).json({ error: 'This action requires a homeowner account' });
    return;
  }
  next();
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      userType: 'homeowner' | 'tradesperson';
      email?: string;
    };
    
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    // If token is invalid, just proceed as guest
    next();
  }
};
