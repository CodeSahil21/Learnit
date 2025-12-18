import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import PDFDocument from 'pdfkit';

export const generateCertificate = async (userId: string, courseId: string): Promise<Buffer> => {
  // Check if user is enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { user_id_course_id: { user_id: userId, course_id: courseId } }
  });
  
  if (!enrollment) throw new AppError('Not enrolled in course', 403);

  // Get course and user details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { chapters: true }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });

  if (!course || !user) throw new AppError('Course or user not found', 404);

  // Block certificate for courses with no chapters
  if (course.chapters.length === 0) {
    throw new AppError('Cannot generate certificate for course with no chapters', 400);
  }

  // Check if all chapters are completed
  const completedChapters = await prisma.progress.count({
    where: {
      user_id: userId,
      chapter_id: { in: course.chapters.map(c => c.id) },
      is_completed: true
    }
  });

  if (completedChapters !== course.chapters.length) {
    throw new AppError('Course not completed', 400);
  }

  // Generate PDF certificate
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on('data', chunk => chunks.push(chunk));
  
  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Certificate content
    doc.fontSize(24).text('Certificate of Completion', 100, 100);
    doc.fontSize(16).text(`This certifies that ${user.email}`, 100, 200);
    doc.text(`has successfully completed the course`, 100, 230);
    doc.fontSize(20).text(`"${course.title}"`, 100, 270);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, 100, 350);

    doc.end();
  });
}