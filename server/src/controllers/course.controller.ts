import { Request, Response, NextFunction } from 'express';
import * as courses from '../services/course.service';
import { courseSchema, chapterSchema, enrollSchema, courseUpdateSchema } from '../utils/schema';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    let data;
    
    if (user.role === 'STUDENT') {
      data = await courses.getStudentCourses(user.id);
    } else {
      data = await courses.listCourses();
    }
    
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    let data;
    
    if (user.role === 'STUDENT') {
      data = await courses.getStudentCourses(user.id);
    } else if (user.role === 'MENTOR') {
      data = await courses.getMentorCourses(user.id);
    } else {
      data = await courses.listCourses();
    }
    
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const courseId = req.params.id;
    
    // If student, check enrollment and apply sequential access
    if (user.role === 'STUDENT') {
      const isEnrolled = await courses.checkEnrollment(user.id, courseId);
      if (!isEnrolled) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
      
      // Get course with sequential chapter access
      const item = await courses.getStudentCourseDetails(user.id, courseId);
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json({ data: item });
    } else if (user.role === 'MENTOR') {
      // Mentors can only view their own courses
      const item = await courses.getCourse(courseId);
      if (!item) return res.status(404).json({ message: 'Not found' });
      if (item.mentor_id !== user.id) {
        return res.status(403).json({ message: 'Can only view your own courses' });
      }
      res.json({ data: item });
    } else {
      // Admins see all course details
      const item = await courses.getCourse(courseId);
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json({ data: item });
    }
  } catch (err) {
    next(err);
  }
}



export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = courseSchema.parse(req.body);
    const created = await courses.createCourse({ ...payload, mentor_id: req.user!.id });
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

export const addChapter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const courseId = req.params.id;
    
    // Check mentor ownership
    if (user.role === 'MENTOR') {
      const course = await courses.getCourse(courseId);
      if (!course || course.mentor_id !== user.id) {
        return res.status(403).json({ message: 'Can only modify your own courses' });
      }
    }
    
    const payload = chapterSchema.parse(req.body);
    const created = await courses.addChapter(courseId, payload);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

export const enrollStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const courseId = req.params.id;
    
    // Check mentor ownership
    if (user.role === 'MENTOR') {
      const course = await courses.getCourse(courseId);
      if (!course || course.mentor_id !== user.id) {
        return res.status(403).json({ message: 'Can only enroll students in your own courses' });
      }
    }
    
    const { user_id } = enrollSchema.parse(req.body);
    const enrollment = await courses.enrollStudent(courseId, user_id);
    res.status(201).json({ data: enrollment });
  } catch (err) {
    next(err);
  }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const courseId = req.params.id;
    
    // Check mentor ownership
    if (user.role === 'MENTOR') {
      const course = await courses.getCourse(courseId);
      if (!course || course.mentor_id !== user.id) {
        return res.status(403).json({ message: 'Can only modify your own courses' });
      }
    }
    
    const payload = courseUpdateSchema.parse(req.body);
    const updated = await courses.updateCourse(courseId, payload);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const courseId = req.params.id;
    
    // If mentor, check ownership
    if (user.role === 'MENTOR') {
      const course = await courses.getCourse(courseId);
      if (!course || course.mentor_id !== user.id) {
        return res.status(403).json({ message: 'Can only delete your own courses' });
      }
    }
    
    const deleted = await courses.deleteCourse(courseId);
    res.json({ data: deleted });
  } catch (err) {
    next(err);
  }
}

export const assignCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const courseId = req.params.id;
    
    // Check mentor ownership
    if (user.role === 'MENTOR') {
      const course = await courses.getCourse(courseId);
      if (!course || course.mentor_id !== user.id) {
        return res.status(403).json({ message: 'Can only assign your own courses' });
      }
    }
    
    const { user_id } = enrollSchema.parse(req.body);
    const assignment = await courses.assignCourse(courseId, user_id);
    res.status(201).json({ data: assignment });
  } catch (err) {
    next(err);
  }
}

export const getChapters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const courseId = req.params.id;
    
    // If student, check enrollment and apply sequential access
    if (user.role === 'STUDENT') {
      const isEnrolled = await courses.checkEnrollment(user.id, courseId);
      if (!isEnrolled) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
      
      // Get chapters with sequential access control
      const chapters = await courses.getStudentAccessibleChapters(user.id, courseId);
      res.json({ data: chapters });
    } else if (user.role === 'MENTOR') {
      // Mentors can only view chapters of their own courses
      const course = await courses.getCourse(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      if (course.mentor_id !== user.id) {
        return res.status(403).json({ message: 'Can only view chapters of your own courses' });
      }
      const chapters = await courses.getCourseChapters(courseId);
      res.json({ data: chapters });
    } else {
      // Admins see all chapters
      const chapters = await courses.getCourseChapters(courseId);
      res.json({ data: chapters });
    }
  } catch (err) {
    next(err);
  }
}

export const getMentorProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mentorId = req.user!.id;
    const courseId = req.params.id;
    const studentId = req.query.userId as string;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student userId is required' });
    }
    
    const progress = await courses.getMentorStudentProgress(mentorId, courseId, studentId);
    res.json({ data: progress });
  } catch (err) {
    next(err);
  }
}
