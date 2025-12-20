import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import type { 
  CreateCourseInput, 
  UpdateCourseInput, 
  CreateChapterInput, 
  CourseWithMentor, 
  CourseWithChapters, 
  CourseDetails, 
  Course, 
  Chapter, 
  Enrollment 
} from '../types/express';

export const listCourses =  async(): Promise<CourseWithMentor[]> => {
  return prisma.course.findMany({ 
    orderBy: { created_at: 'desc' },
    include: { 
      mentor: { select: { id: true, email: true } },
      chapters: true
    }
  }) as Promise<CourseWithMentor[]>;
}

export const getMentorCourses = async (mentorId: string): Promise<CourseWithChapters[]> => {
  return prisma.course.findMany({ 
    where: { mentor_id: mentorId },
    orderBy: { created_at: 'desc' },
    include: { chapters: true }
  }) as Promise<CourseWithChapters[]>;
}

export const getStudentCourses = async (studentId: string): Promise<CourseWithMentor[]> => {
  return prisma.course.findMany({
    where: { enrollments: { some: { user_id: studentId } } },
    orderBy: { created_at: 'desc' },
    include: { 
      mentor: { select: { id: true, email: true } },
      chapters: true
    }
  }) as Promise<CourseWithMentor[]>;
}

export const getCourse = async (id: string): Promise<CourseDetails | null> => {
  return prisma.course.findUnique({ 
    where: { id },
    include: { chapters: { orderBy: { sequence_number: 'asc' } }, mentor: { select: { id: true, email: true } } }
  }) as Promise<CourseDetails | null>;
}

export const createCourse = async (data: CreateCourseInput): Promise<Course> => {
  return prisma.course.create({ data }) as Promise<Course>;
}

export const addChapter = async (courseId: string, data: CreateChapterInput): Promise<Chapter> => {
  const existing = await prisma.chapter.findFirst({
    where: { 
      course_id: courseId, 
      sequence_number: data.sequence_number 
    }
  });
  
  if (existing) throw new AppError('Chapter with this sequence number already exists', 409);
  
  return prisma.chapter.create({ 
    data: { ...data, course_id: courseId }
  }) as Promise<Chapter>;
}

export const enrollStudent = async (courseId: string, userId: string): Promise<Enrollment> => {
  const existing = await prisma.enrollment.findUnique({
    where: { user_id_course_id: { user_id: userId, course_id: courseId } }
  });
  
  if (existing) throw new AppError('Student already enrolled in this course', 409);
  
  return prisma.enrollment.create({ 
    data: { course_id: courseId, user_id: userId }
  }) as Promise<Enrollment>;
}

export const assignCourse = async (courseId: string, userId: string): Promise<Enrollment> => {
  const existing = await prisma.enrollment.findUnique({
    where: { user_id_course_id: { user_id: userId, course_id: courseId } }
  });
  
  if (existing) throw new AppError('Student already assigned to this course', 409);
  
  return prisma.enrollment.create({ 
    data: { course_id: courseId, user_id: userId }
  }) as Promise<Enrollment>;
}

export const getCourseChapters = async (courseId: string): Promise<Chapter[]> => {
  return prisma.chapter.findMany({
    where: { course_id: courseId },
    orderBy: { sequence_number: 'asc' }
  }) as Promise<Chapter[]>;
}

export const checkEnrollment = async (userId: string, courseId: string): Promise<boolean> => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { user_id_course_id: { user_id: userId, course_id: courseId } }
  });
  return !!enrollment;
}

export const getStudentCourseDetails = async (userId: string, courseId: string) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { mentor: { select: { id: true, email: true } } }
  });
  
  if (!course) return null;
  
  const accessibleChapters = await getStudentAccessibleChapters(userId, courseId);
  
  return {
    ...course,
    chapters: accessibleChapters
  };
}

export const getStudentAccessibleChapters = async (userId: string, courseId: string): Promise<Chapter[]> => {
  const chapters = await prisma.chapter.findMany({
    where: { course_id: courseId },
    orderBy: { sequence_number: 'asc' },
    include: {
      progresses: {
        where: { user_id: userId },
        select: { is_completed: true }
      }
    }
  });

  // Find the highest accessible chapter (last completed + 1)
  let accessibleUpTo = 1; // First chapter is always accessible
  for (const chapter of chapters) {
    if (chapter.progresses[0]?.is_completed) {
      accessibleUpTo = chapter.sequence_number + 1;
    } else {
      break;
    }
  }

  // Return only accessible chapters (hide content for locked chapters)
  return chapters.map(chapter => {
    const isAccessible = chapter.sequence_number <= accessibleUpTo;
    return {
      ...chapter,
      // Hide content URLs for inaccessible chapters
      image_url: isAccessible ? chapter.image_url : null,
      video_url: isAccessible ? chapter.video_url : null,
      description: isAccessible ? chapter.description : 'Complete previous chapters to unlock',
      is_accessible: isAccessible
    } as Chapter;
  });
}

export const getMentorStudentProgress = async (mentorId: string, courseId: string, studentId: string) => {
  // Verify mentor owns the course
  const course = await prisma.course.findFirst({
    where: { id: courseId, mentor_id: mentorId }
  });
  
  if (!course) throw new AppError('Course not found or not owned by mentor', 403);
  
  // Get all chapters and progress
  const chapters = await prisma.chapter.findMany({
    where: { course_id: courseId },
    orderBy: { sequence_number: 'asc' },
    include: {
      progresses: {
        where: { user_id: studentId },
        select: { is_completed: true, completed_at: true }
      }
    }
  });
  
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(ch => ch.progresses[0]?.is_completed).length;
  const progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  
  return {
    courseId,
    studentId,
    totalChapters,
    completedChapters,
    progressPercentage,
    chapters: chapters.map(ch => ({
      id: ch.id,
      title: ch.title,
      sequence_number: ch.sequence_number,
      is_completed: ch.progresses[0]?.is_completed || false,
      completed_at: ch.progresses[0]?.completed_at || null
    }))
  };
}

export const updateCourse = async (id: string, data: UpdateCourseInput): Promise<Course> => {
  return prisma.course.update({ where: { id }, data }) as Promise<Course>;
}

export const deleteCourse = async (id: string): Promise<Course> => {
  return prisma.course.delete({ where: { id } }) as Promise<Course>;
}

export const bulkAssignStudents = async (courseId: string, userIds: string[]) => {
  const enrollments = userIds.map(userId => ({
    course_id: courseId,
    user_id: userId
  }));
  
  const result = await prisma.enrollment.createMany({
    data: enrollments,
    skipDuplicates: true
  });
  
  return { created: result.count, total: userIds.length };
}

export const getCourseStudents = async (courseId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { course_id: courseId },
    include: {
      user: { select: { id: true, email: true } }
    },
    orderBy: { assigned_at: 'desc' }
  });
  
  // Calculate progress for each student
  const studentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalChapters = await prisma.chapter.count({
        where: { course_id: courseId }
      });
      
      const completedChapters = await prisma.progress.count({
        where: {
          user_id: enrollment.user_id,
          is_completed: true,
          chapter: { course_id: courseId }
        }
      });
      
      const progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      
      return {
        id: enrollment.user.id,
        email: enrollment.user.email,
        enrolled_at: enrollment.assigned_at,
        progress_percentage: progressPercentage
      };
    })
  );
  
  return studentsWithProgress;
}

export const getChapterById = async (chapterId: string): Promise<Chapter | null> => {
  return prisma.chapter.findUnique({ where: { id: chapterId } }) as Promise<Chapter | null>;
}

export const getStudentChapterAccess = async (userId: string, courseId: string, chapterId: string) => {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      progresses: {
        where: { user_id: userId },
        select: { is_completed: true }
      }
    }
  });
  
  if (!chapter || chapter.course_id !== courseId) return null;
  
  // Check if previous chapters are completed
  const previousChapters = await prisma.chapter.findMany({
    where: {
      course_id: courseId,
      sequence_number: { lt: chapter.sequence_number }
    },
    include: {
      progresses: {
        where: { user_id: userId, is_completed: true }
      }
    }
  });
  
  const allPreviousCompleted = previousChapters.every(ch => ch.progresses.length > 0);
  const isAccessible = chapter.sequence_number === 1 || allPreviousCompleted;
  
  return {
    ...chapter,
    is_accessible: isAccessible,
    image_url: isAccessible ? chapter.image_url : null,
    video_url: isAccessible ? chapter.video_url : null,
    description: isAccessible ? chapter.description : 'Complete previous chapters to unlock'
  };
}
