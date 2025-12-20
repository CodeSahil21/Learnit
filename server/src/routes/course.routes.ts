import { Router } from 'express';
import * as courses from '../controllers/course.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { requireApprovedMentor } from '../middlewares/mentorApproval.middleware';

const r = Router();

// All routes require authentication
r.get('/', authenticate, courses.list);
r.get('/my', authenticate, authorize(['STUDENT', 'MENTOR', 'ADMIN']), courses.getMyCourses);
r.get('/:id', authenticate, courses.get);
r.get('/:id/chapters', authenticate, authorize(['STUDENT', 'MENTOR', 'ADMIN']), courses.getChapters);
r.post('/', authenticate, authorize(['MENTOR']), requireApprovedMentor, courses.create);
r.post('/:id/chapters', authenticate, authorize(['MENTOR']), requireApprovedMentor, courses.addChapter);
r.post('/:id/assign', authenticate, authorize(['MENTOR']), requireApprovedMentor, courses.assignCourse);
r.post('/:id/assign/bulk', authenticate, authorize(['MENTOR', 'ADMIN']), requireApprovedMentor, courses.bulkAssignCourse);
r.post('/:id/enroll', authenticate, authorize(['MENTOR', 'ADMIN']), requireApprovedMentor, courses.enrollStudent);
r.get('/:id/students', authenticate, authorize(['MENTOR', 'ADMIN']), requireApprovedMentor, courses.getCourseStudents);
r.get('/:courseId/chapters/:chapterId', authenticate, courses.getChapterDetail);
r.put('/:id', authenticate, authorize(['MENTOR']), requireApprovedMentor, courses.update);
r.get('/:id/progress', authenticate, authorize(['MENTOR']), requireApprovedMentor, courses.getMentorProgress);
r.delete('/:id', authenticate, authorize(['MENTOR', 'ADMIN']), requireApprovedMentor, courses.remove);

export default r;
