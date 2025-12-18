import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import type { Progress, ChapterProgress } from '../types/express';

export const getChapterProgress = async (userId: string, courseId: string) => {
  const chapters = await prisma.chapter.findMany({
    where: { course_id: courseId },
    orderBy: { sequence_number: 'asc' },
    include: {
      progresses: {
        where: { user_id: userId },
        select: { is_completed: true, completed_at: true }
      }
    }
  });

  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(ch => ch.progresses[0]?.is_completed).length;
  const progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return {
    courseId,
    totalChapters,
    completedChapters,
    progressPercentage,
    chapters: chapters.map(chapter => ({
      chapter_id: chapter.id,
      sequence_number: chapter.sequence_number,
      is_completed: chapter.progresses[0]?.is_completed || false,
      completed_at: chapter.progresses[0]?.completed_at || null
    }))
  };
}

export const completeChapter = async (userId: string, chapterId: string): Promise<Progress> => {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { sequence_number: true, course_id: true }
  });

  if (!chapter) throw new AppError('Chapter not found', 404);

  // Check if student is enrolled in the course
  const enrollment = await prisma.enrollment.findUnique({
    where: { user_id_course_id: { user_id: userId, course_id: chapter.course_id } }
  });
  
  if (!enrollment) throw new AppError('Not enrolled in this course', 403);

  if (chapter.sequence_number > 1) {
    const prevChapter = await prisma.chapter.findFirst({
      where: {
        course_id: chapter.course_id,
        sequence_number: chapter.sequence_number - 1
      },
      include: {
        progresses: {
          where: { user_id: userId, is_completed: true }
        }
      }
    });

    if (!prevChapter || prevChapter.progresses.length === 0) {
      throw new AppError('Previous chapter not completed', 403);
    }
  }

  return prisma.progress.upsert({
    where: {
      user_id_chapter_id: { user_id: userId, chapter_id: chapterId }
    },
    create: {
      user_id: userId,
      chapter_id: chapterId,
      is_completed: true,
      completed_at: new Date()
    },
    update: {
      is_completed: true,
      completed_at: new Date()
    }
  }) as Promise<Progress>;
}
