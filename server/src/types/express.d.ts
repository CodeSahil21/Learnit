import 'express';
import type { JwtUser } from '../utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUser;
  }
}

export interface CreateCourseInput {
  title: string;
  description: string;
  mentor_id: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
}

export interface CreateChapterInput {
  title: string;
  description: string;
  video_url?: string;
  image_url?: string;
  sequence_number: number;
}

export interface EnrollmentInput {
  course_id: string;
  user_id: string;
}

export interface CourseWithMentor {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  created_at: Date;
  mentor: { id: string; email: string };
}

export interface CourseWithChapters {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  created_at: Date;
  chapters: Chapter[];
}

export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  created_at: Date;
  chapters: Chapter[];
  mentor: { id: string; email: string };
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  image_url?: string;
  sequence_number: number;
  course_id: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  created_at: Date;
}

export interface Enrollment {
  user_id: string;
  course_id: string;
  assigned_at: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
}

export interface AuthUser {
  id: string;
  email: string;
  password_hash: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
  is_verified: boolean;
  created_at: Date;
}

export interface Progress {
  user_id: string;
  chapter_id: string;
  is_completed: boolean;
  completed_at?: Date;
}

export interface ChapterProgress {
  chapter_id: string;
  sequence_number: number;
  is_completed: boolean;
}

// Course Service Interfaces
export interface CourseService {
  listCourses(): Promise<CourseWithMentor[]>;
  getMentorCourses(mentorId: string): Promise<CourseWithChapters[]>;
  getStudentCourses(studentId: string): Promise<CourseWithMentor[]>;
  getCourse(id: string): Promise<CourseDetails | null>;
  createCourse(data: CreateCourseInput): Promise<Course>;
  addChapter(courseId: string, data: CreateChapterInput): Promise<Chapter>;
  enrollStudent(courseId: string, userId: string): Promise<Enrollment>;
  assignCourse(courseId: string, userId: string): Promise<Enrollment>;
  getCourseChapters(courseId: string): Promise<Chapter[]>;
  checkEnrollment(userId: string, courseId: string): Promise<boolean>;
  updateCourse(id: string, data: UpdateCourseInput): Promise<Course>;
  deleteCourse(id: string): Promise<Course>;
}

// Progress Service Interfaces
export interface ProgressService {
  getChapterProgress(userId: string, courseId: string): Promise<ChapterProgress[]>;
  completeChapter(userId: string, chapterId: string): Promise<Progress>;
}

// Auth Service Interfaces
export interface AuthService {
  registerUser(email: string, password: string): Promise<AuthUser>;
  loginUser(email: string, password: string): Promise<AuthUser>;
  getProfile(userId: string): Promise<UserProfile | null>;
}

// Admin Service Interfaces
export interface AdminService {
  getAllUsers(): Promise<UserProfile[]>;
  approveMentor(userId: string): Promise<AuthUser>;
  deleteUser(userId: string): Promise<AuthUser>;
}

// Certificate Service Interfaces
export interface CertificateService {
  generateCertificate(userId: string, courseId: string): Promise<Buffer>;
}