import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';
import type { AuthUser, UserProfile } from '../types/express';

export const registerUser = async (email: string, password: string): Promise<AuthUser> => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError('Email already in use', 409);
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password_hash: hash, role: 'STUDENT' },
  });

  return user as AuthUser;
}

export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new AppError('Invalid credentials', 401);
  return user as AuthUser;
}

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  }) as Promise<UserProfile | null>;
}

// Development only - create admin/mentor
export const createAdmin = async (email: string, password: string): Promise<AuthUser> => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError('Email already in use', 409);
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password_hash: hash, role: 'ADMIN', is_verified: true },
  });

  return user as AuthUser;
}

export const createMentor = async (email: string, password: string): Promise<AuthUser> => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError('Email already in use', 409);
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password_hash: hash, role: 'MENTOR', is_verified: false },
  });

  return user as AuthUser;
}
