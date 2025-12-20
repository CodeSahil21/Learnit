import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({ 
  email: z.string().email(), 
  password: z.string().min(1) 
});

// Course Schemas
export const courseSchema = z.object({ 
  title: z.string().min(1, 'Title is required'), 
  description: z.string().min(1, 'Description is required') 
});

export const courseUpdateSchema = courseSchema.partial();

// Chapter Schemas
export const chapterSchema = z.object({ 
  title: z.string().min(1, 'Title is required'), 
  description: z.string().min(1, 'Description is required'), 
  video_url: z.string().url().optional().or(z.literal('')), 
  image_url: z.string().url().optional().or(z.literal('')), 
  sequence_number: z.number().int().positive('Sequence number must be positive') 
});

// Enrollment Schemas
export const enrollSchema = z.object({ 
  user_id: z.string().min(1, 'User ID is required') 
});

// Progress Schemas
export const progressSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required')
});

// Admin Schemas
export const userApprovalSchema = z.object({
  id: z.string().min(1, 'User ID is required')
});

export const createUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN'], { message: 'Role is required' })
});

export const bulkAssignSchema = z.object({
  user_ids: z.array(z.string().min(1, 'User ID cannot be empty')).min(1, 'At least one user ID is required')
});