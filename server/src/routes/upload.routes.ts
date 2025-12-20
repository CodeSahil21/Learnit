import { Router } from 'express';
import { upload } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { requireApprovedMentor } from '../middlewares/mentorApproval.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.post(
  '/upload',
  authenticate,
  authorize(['MENTOR', 'ADMIN']),
  requireApprovedMentor,
  uploadMiddleware,
  upload
);

export default router;