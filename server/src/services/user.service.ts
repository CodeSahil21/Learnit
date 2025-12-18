import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import type { AuthUser } from '../types/express';

export const approveUser = async (userId: string): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new AppError('User not found', 404);
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { is_verified: true }
  });
  
  return updatedUser as AuthUser;
}