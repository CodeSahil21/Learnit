import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';
import type { AuthUser } from '../types/express';

export const getAllUsers = () => {
  return prisma.user.findMany({
    select: { id: true, email: true, role: true, is_verified: true, created_at: true }
  });
}

export const approveMentor = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'MENTOR') throw new AppError('User is not a mentor', 400);
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { is_verified: true },
    select: { id: true, email: true, role: true, is_verified: true, created_at: true }
  });
  
  return updatedUser;
}

export const rejectMentor = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'MENTOR') throw new AppError('User is not a mentor', 400);
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { is_verified: false },
    select: { id: true, email: true, role: true, is_verified: true, created_at: true }
  });
  
  return updatedUser;
}

export const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  
  return prisma.user.delete({ where: { id: userId } });
}

export const createUser = async (email: string, password: string, role: 'STUDENT' | 'MENTOR' | 'ADMIN') => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError('Email already in use', 409);
  
  const hash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: { 
      email, 
      password_hash: hash, 
      role,
      is_verified: role === 'MENTOR' ? false : true // Mentors need approval
    },
    select: { id: true, email: true, role: true, is_verified: true, created_at: true }
  });

  return user;
}

export const searchStudents = async (query: string) => {
  return prisma.user.findMany({
    where: {
      role: 'STUDENT',
      email: { contains: query, mode: 'insensitive' }
    },
    select: { id: true, email: true, created_at: true },
    take: 20
  });
}

export const getAdminCourses = async () => {
  return prisma.course.findMany({
    include: {
      mentor: { select: { id: true, email: true } },
      _count: {
        select: {
          enrollments: true,
          chapters: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

export const getAdminEnrollments = async () => {
  return prisma.enrollment.findMany({
    include: {
      user: { select: { id: true, email: true, role: true } },
      course: { 
        select: { 
          id: true, 
          title: true, 
          mentor: { select: { id: true, email: true } }
        } 
      }
    },
    orderBy: { assigned_at: 'desc' }
  });
}