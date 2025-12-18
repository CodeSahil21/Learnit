import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/db';

export const requireApprovedMentor = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    
    if (user.role === 'MENTOR') {
      const mentorData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { is_verified: true }
      });
      
      if (!mentorData?.is_verified) {
        return next(new AppError('Mentor account not approved', 403));
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};