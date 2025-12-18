import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import * as adminService from '../services/admin.service';

export const metrics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, courses, enrollments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
    ]);
    res.json({ users, courses, enrollments });
  } catch (err) {
    next(err);
  }
}

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

export const approveMentor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const user = await adminService.approveMentor(userId);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export const rejectMentor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const user = await adminService.rejectMentor(userId);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    await adminService.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }
    
    if (!['STUDENT', 'MENTOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const user = await adminService.createUser(email, password, role);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, courses] = await Promise.all([
      prisma.user.count(),
      prisma.course.count()
    ]);
    
    // Count full-course completions
    const allCourses = await prisma.course.findMany({
      include: {
        chapters: true,
        enrollments: {
          include: {
            user: {
              include: {
                progresses: {
                  where: { is_completed: true }
                }
              }
            }
          }
        }
      }
    });
    
    let certificates = 0;
    allCourses.forEach(course => {
      const totalChapters = course.chapters.length;
      if (totalChapters > 0) {
        course.enrollments.forEach(enrollment => {
          const completedInThisCourse = enrollment.user.progresses.filter(
            progress => course.chapters.some(ch => ch.id === progress.chapter_id)
          ).length;
          if (completedInThisCourse === totalChapters) {
            certificates++;
          }
        });
      }
    });
    
    res.json({ users, courses, certificates });
  } catch (err) {
    next(err);
  }
}
