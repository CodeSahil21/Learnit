import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }
  const token = auth.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch {
    return next(new AppError('Invalid token', 401));
  }
}
