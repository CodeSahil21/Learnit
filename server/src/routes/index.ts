import { Router } from 'express';
import auth from './auth.routes';
import course from './course.routes';
import progress from './progress.routes';
import admin from './admin.routes';
import certificate from './certificate.routes';
import upload from './upload.routes';

const router = Router();

// Routes without /api prefix (will be added in app.ts)
router.use('/auth', auth);
router.use('/courses', course);
router.use('/progress', progress);
router.use('/', admin);
router.use('/certificates', certificate);
router.use('/', upload);

export default router;
